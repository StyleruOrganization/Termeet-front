import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  createTeamRequest,
  deleteTeamRequest,
  listTeamsRequest,
  updateTeamRequest,
  uploadTeamPhotoRequest,
  type ITeam,
  type ITeamMember,
} from "@/entities/Team";
import { searchUsersRequest, useSessionStore, type IUserSearchItem } from "@/entities/User";
import { useToastStore } from "@/features/ToastContainer";
import { useTranslation } from "@/shared/i18n";
import { Container, Input, ModalWrapper, PhotoPicker, TextArea, teamPhotoUrl, UserSearch } from "@/shared/ui";
import Arrow from "@assets/icons/arrow.svg";
import CrossIcon from "@assets/icons/cross.svg";
import styles from "./Teams.module.css";

type Draft = {
  id: number | null;
  name: string;
  description: string;
  members: ITeamMember[];
  photoSrc: string | null;
  photoFile: File | null;
};

const emptyDraft = (): Draft => ({
  id: null,
  name: "",
  description: "",
  members: [],
  photoSrc: null,
  photoFile: null,
});

const memberName = (item: { first_name: string; last_name: string } | ITeamMember) =>
  `${item.first_name} ${item.last_name}`.trim();

const photoBust = () => Date.now();

export const Teams = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const user = useSessionStore(state => state.user);
  const status = useSessionStore(state => state.status);
  const addToast = useToastStore(state => state.addToast);
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (status === "anonymous") {
      navigate("/", { replace: true });
    }
  }, [navigate, status]);

  const { data: teams = [], isLoading } = useQuery({
    queryKey: ["teams"],
    queryFn: listTeamsRequest,
    enabled: Boolean(user),
  });

  const excludeIds = useMemo(() => {
    const ids = (draft?.members ?? []).map(item => item.id);
    if (user) {
      ids.push(user.id);
    }
    return ids;
  }, [draft?.members, user]);

  const saveMutation = useMutation({
    mutationFn: async (current: Draft) => {
      const payload = {
        name: current.name.trim(),
        description: current.description.trim(),
        memberIds: current.members.map(item => item.id),
      };
      const saved = current.id ? await updateTeamRequest(current.id, payload) : await createTeamRequest(payload);
      if (current.photoFile) {
        return uploadTeamPhotoRequest(saved.id, current.photoFile);
      }
      return saved;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      setDraft(null);
      addToast({ id: "team-saved", type: "success", message: t("teams.saved") });
    },
    onError: () => {
      addToast({ id: "team-saved-error", type: "error", message: t("teams.saveError") });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTeamRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      setDeleteOpen(false);
      setDraft(null);
      addToast({ id: "team-deleted", type: "success", message: t("teams.deleted") });
    },
    onError: () => {
      addToast({ id: "team-deleted-error", type: "error", message: t("teams.deleteError") });
    },
  });

  if (!user) {
    return null;
  }

  const openCreate = () => setDraft(emptyDraft());
  const openEdit = (team: ITeam) =>
    setDraft({
      id: team.id,
      name: team.name,
      description: team.description,
      members: team.members,
      photoSrc: team.hasPhoto ? teamPhotoUrl(team.id, photoBust()) : null,
      photoFile: null,
    });

  const addMember = (item: IUserSearchItem) => {
    setDraft(current => {
      if (!current || current.members.some(member => member.id === item.id)) {
        return current;
      }
      return {
        ...current,
        members: [
          ...current.members,
          {
            id: item.id,
            first_name: item.first_name,
            last_name: item.last_name,
            has_avatar: item.has_avatar,
          },
        ],
      };
    });
  };

  const canSave = Boolean(draft && draft.name.trim() && (draft.id == null || draft.id));

  return (
    <Container>
      <button type='button' className={styles.Teams__Back} onClick={() => navigate("/")}>
        <Arrow className={styles.Teams__BackIcon} />
        {t("teams.back")}
      </button>
      <div className={styles.Teams__Header}>
        <h1 className={styles.Teams__Title}>{t("teams.title")}</h1>
        <button type='button' className={`baseButton mainButton ${styles.Teams__Create}`} onClick={openCreate}>
          {t("teams.create")}
        </button>
      </div>
      <p className={styles.Teams__Lead}>{t("teams.lead")}</p>
      {isLoading ? <p className={styles.Teams__Empty}>{t("teams.loading")}</p> : null}
      {!isLoading && teams.length === 0 ? <p className={styles.Teams__Empty}>{t("teams.empty")}</p> : null}
      <div className={styles.Teams__List}>
        {teams.map(team => (
          <button key={team.id} type='button' className={styles.Teams__Card} onClick={() => openEdit(team)}>
            {team.hasPhoto ? (
              <img src={teamPhotoUrl(team.id)} alt='' className={styles.Teams__CardPhoto} />
            ) : (
              <span className={styles.Teams__CardPhotoFallback} aria-hidden>
                {team.name.slice(0, 1)}
              </span>
            )}
            <span className={styles.Teams__CardBody}>
              <span className={styles.Teams__CardName}>{team.name}</span>
              <span className={styles.Teams__CardMeta}>
                {t("teams.people", { count: team.members.length })}
                {team.isOwner ? ` · ${t("teams.youOwner")}` : ""}
              </span>
            </span>
            <Arrow className={styles.Teams__CardArrow} />
          </button>
        ))}
      </div>

      <ModalWrapper isOpen={Boolean(draft)} onClose={() => setDraft(null)} isAnimate>
        {draft ? (
          <div className={styles.Teams__Form}>
            <h2>{draft.id ? t("teams.edit") : t("teams.create")}</h2>
            <PhotoPicker
              src={draft.photoSrc}
              label={t("teams.photo")}
              hint={t("teams.photoHint")}
              disabled={
                saveMutation.isPending || (draft.id != null && !teams.find(item => item.id === draft.id)?.isOwner)
              }
              onFile={file => {
                setDraft(current =>
                  current ? { ...current, photoFile: file, photoSrc: URL.createObjectURL(file) } : current,
                );
              }}
            />
            <Input
              name='team-name'
              label={t("teams.name")}
              placeholder={t("teams.namePlaceholder")}
              value={draft.name}
              readOnly={draft.id != null && !teams.find(item => item.id === draft.id)?.isOwner}
              onChange={event => setDraft({ ...draft, name: event.target.value })}
            />
            <TextArea
              name='team-description'
              label={t("teams.description")}
              placeholder={t("teams.descriptionPlaceholder")}
              value={draft.description}
              onChange={event => setDraft({ ...draft, description: event.target.value })}
              readOnly={draft.id != null && !teams.find(item => item.id === draft.id)?.isOwner}
            />
            {draft.id != null && !teams.find(item => item.id === draft.id)?.isOwner ? null : (
              <UserSearch
                label={t("teams.addPeople")}
                placeholder={t("create.invitePlaceholder")}
                hint={t("teams.addHint")}
                emptyText={t("create.inviteEmpty")}
                excludeIds={excludeIds}
                searchUsers={searchUsersRequest}
                onPick={addMember}
              />
            )}
            {draft.members.length ? (
              <div className={styles.Teams__Chips}>
                {draft.members.map(member => (
                  <div key={member.id} className={styles.Teams__Chip}>
                    <span>{memberName(member)}</span>
                    {draft.id != null && !teams.find(item => item.id === draft.id)?.isOwner ? null : (
                      <button
                        type='button'
                        className={styles.Teams__ChipRemove}
                        aria-label={t("create.inviteRemove", { name: memberName(member) })}
                        onClick={() =>
                          setDraft({
                            ...draft,
                            members: draft.members.filter(item => item.id !== member.id),
                          })
                        }
                      >
                        <CrossIcon />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : null}
            {draft.id != null && !teams.find(item => item.id === draft.id)?.isOwner ? null : (
              <div className={styles.Teams__Actions}>
                <button
                  type='button'
                  className='baseButton mainButton'
                  disabled={!draft.name.trim() || saveMutation.isPending || !canSave}
                  onClick={() => saveMutation.mutate(draft)}
                >
                  {t("teams.save")}
                </button>
                {draft.id && teams.find(item => item.id === draft.id)?.isOwner ? (
                  <button type='button' className='baseButton outlineButton' onClick={() => setDeleteOpen(true)}>
                    {t("teams.delete")}
                  </button>
                ) : null}
              </div>
            )}
            {draft.id && teams.find(item => item.id === draft.id)?.isOwner === false ? (
              <p className={styles.Teams__Hint}>{t("teams.memberHint")}</p>
            ) : null}
          </div>
        ) : null}
      </ModalWrapper>

      <ModalWrapper compact isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} isAnimate>
        <div className={styles.Teams__Delete}>
          <h2>{t("teams.deleteTitle")}</h2>
          <p>{t("teams.deleteText")}</p>
          <button
            type='button'
            className='baseButton outlineButton'
            disabled={deleteMutation.isPending}
            onClick={() => draft?.id && deleteMutation.mutate(draft.id)}
          >
            {t("teams.deleteConfirm")}
          </button>
        </div>
      </ModalWrapper>
    </Container>
  );
};
