import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { listTeamsRequest } from "@/entities/Team";
import {
  emptyBotTemplate,
  parseAliasInput,
  previewBotCommand,
  validateBotTemplates,
  type IBotTemplate,
  useSessionStore,
} from "@/entities/User";
import { useToastStore } from "@/features/ToastContainer";
import { DURATIONS } from "@/shared/consts";
import { useTranslation } from "@/shared/i18n";
import { Input, ModalWrapper, Select, TextArea } from "@/shared/ui";
import styles from "./BotTemplates.module.css";

const CLOCKS = Array.from({ length: 48 }, (_, index) => {
  const hours = Math.floor(index / 2)
    .toString()
    .padStart(2, "0");
  const minutes = index % 2 === 0 ? "00" : "30";
  return `${hours}:${minutes}`;
});

type Props = { templates: IBotTemplate[] };

export const BotTemplates = ({ templates }: Props) => {
  const { t } = useTranslation();
  const updateSettings = useSessionStore(state => state.updateSettings);
  const addToast = useToastStore(state => state.addToast);
  const [draft, setDraft] = useState<IBotTemplate | null>(null);
  const [aliasesToday, setAliasesToday] = useState("");
  const [aliasesTomorrow, setAliasesTomorrow] = useState("");
  const [aliasesDayAfter, setAliasesDayAfter] = useState("");
  const [saving, setSaving] = useState(false);
  const { data: teams = [] } = useQuery({
    queryKey: ["teams"],
    queryFn: listTeamsRequest,
  });

  const teamSlugs = useMemo(() => teams.map(item => item.slug).filter(Boolean) as string[], [teams]);

  const packed = (current: IBotTemplate): IBotTemplate => ({
    ...current,
    slug: current.slug.trim().toLowerCase(),
    aliases_today: parseAliasInput(aliasesToday),
    aliases_tomorrow: parseAliasInput(aliasesTomorrow),
    aliases_day_after: parseAliasInput(aliasesDayAfter),
    team_id: current.team_mode === "pinned" ? current.team_id : null,
    time_default: current.time_mode === "off" ? null : current.time_default,
  });

  const nextList = draft
    ? templates.some(item => item.id === draft.id)
      ? templates.map(item => (item.id === draft.id ? packed(draft) : item))
      : [...templates, packed(draft)]
    : templates;
  const formError = draft ? validateBotTemplates(nextList, teamSlugs) : null;

  const openNew = () => {
    const next = emptyBotTemplate();
    setDraft(next);
    setAliasesToday("");
    setAliasesTomorrow("");
    setAliasesDayAfter("");
  };

  const openEdit = (item: IBotTemplate) => {
    setDraft({ ...item });
    setAliasesToday(item.aliases_today.join(", "));
    setAliasesTomorrow(item.aliases_tomorrow.join(", "));
    setAliasesDayAfter(item.aliases_day_after.join(", "));
  };

  const saveDraft = async () => {
    if (!draft || formError) {
      if (formError) {
        addToast({ id: "bot-tpl-invalid", type: "error", message: formError });
      }
      return;
    }
    setSaving(true);
    try {
      await updateSettings({ bot_templates: nextList });
      addToast({ id: "bot-tpl-saved", type: "success", message: t("toast.botTemplateSaved") });
      setDraft(null);
    } catch {
      addToast({ id: "bot-tpl-error", type: "error", message: t("toast.botTemplateError") });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    setSaving(true);
    try {
      await updateSettings({ bot_templates: templates.filter(item => item.id !== id) });
      addToast({ id: "bot-tpl-saved", type: "success", message: t("toast.botTemplateSaved") });
      setDraft(null);
    } catch {
      addToast({ id: "bot-tpl-error", type: "error", message: t("toast.botTemplateError") });
    } finally {
      setSaving(false);
    }
  };

  const preview = draft ? previewBotCommand(packed(draft), teams.find(item => item.id === draft.team_id)?.slug) : "";

  return (
    <section>
      <h2 className={styles.BotTemplates__Title}>{t("profile.botTemplatesTitle")}</h2>
      <p className={styles.BotTemplates__Hint}>{t("profile.botTemplatesHint")}</p>
      <div className={styles.BotTemplates__List}>
        {templates.map(item => (
          <button key={item.id} type='button' className={styles.BotTemplates__Row} onClick={() => openEdit(item)}>
            <span>/{item.slug}</span>
            <span className={styles.BotTemplates__RowMeta}>{item.name}</span>
          </button>
        ))}
      </div>
      <button
        type='button'
        className={`baseButton mainButton ${styles.BotTemplates__Add}`}
        disabled={templates.length >= 10}
        onClick={openNew}
      >
        {t("profile.botTemplatesAdd")}
      </button>

      <ModalWrapper isOpen={Boolean(draft)} onClose={() => setDraft(null)} isAnimate>
        {draft ? (
          <div className={styles.BotTemplates__Form}>
            <h2>{draft.slug ? t("profile.botTemplatesEdit") : t("profile.botTemplatesAdd")}</h2>
            <p className={styles.BotTemplates__Hint}>{t("profile.botTemplatesFormHint")}</p>
            <Input
              name='bot-slug'
              label={t("profile.botTemplatesSlug")}
              placeholder='daily'
              value={draft.slug}
              onChange={event => setDraft({ ...draft, slug: event.target.value })}
            />
            <Input
              name='bot-name'
              label={t("profile.botTemplatesName")}
              placeholder={t("profile.botTemplatesNamePh")}
              value={draft.name}
              onChange={event => setDraft({ ...draft, name: event.target.value })}
            />
            <TextArea
              name='bot-desc'
              label={t("profile.botTemplatesDescription")}
              placeholder={t("profile.botTemplatesPlaceholders")}
              value={draft.description}
              onChange={event => setDraft({ ...draft, description: event.target.value })}
            />
            <Select
              name='bot-duration'
              label={t("profile.botTemplatesDuration")}
              options={[...DURATIONS]}
              value={draft.duration}
              onChange={value => setDraft({ ...draft, duration: value })}
            />
            <Select
              name='bot-date'
              label={t("profile.botTemplatesDate")}
              options={[t("profile.botDateRequired"), t("profile.botDateOptional"), t("profile.botDateOff")]}
              value={
                draft.date_mode === "required"
                  ? t("profile.botDateRequired")
                  : draft.date_mode === "optional"
                    ? t("profile.botDateOptional")
                    : t("profile.botDateOff")
              }
              onChange={value =>
                setDraft({
                  ...draft,
                  date_mode:
                    value === t("profile.botDateOptional")
                      ? "optional"
                      : value === t("profile.botDateOff")
                        ? "off"
                        : "required",
                })
              }
            />
            {draft.date_mode !== "off" ? (
              <>
                <Input
                  name='bot-alias-today'
                  label={t("profile.botAliasToday")}
                  placeholder='td, сегодня'
                  value={aliasesToday}
                  onChange={event => setAliasesToday(event.target.value)}
                />
                <Input
                  name='bot-alias-tmrw'
                  label={t("profile.botAliasTomorrow")}
                  placeholder='tmrw, завтра'
                  value={aliasesTomorrow}
                  onChange={event => setAliasesTomorrow(event.target.value)}
                />
                <Input
                  name='bot-alias-dat'
                  label={t("profile.botAliasDayAfter")}
                  placeholder='dat, послезавтра'
                  value={aliasesDayAfter}
                  onChange={event => setAliasesDayAfter(event.target.value)}
                />
                <p className={styles.BotTemplates__Hint}>{t("profile.botAliasHint")}</p>
                <label className={styles.BotTemplates__Toggle}>
                  <span>{t("profile.botDateDefaultToday")}</span>
                  <button
                    type='button'
                    role='switch'
                    aria-checked={draft.date_default_today}
                    className={`${styles.BotTemplates__Switch} ${draft.date_default_today ? styles.BotTemplates__Switch_on : ""}`}
                    onClick={() => setDraft({ ...draft, date_default_today: !draft.date_default_today })}
                  />
                </label>
              </>
            ) : null}
            <Select
              name='bot-team'
              label={t("profile.botTeam")}
              options={[t("profile.botTeamOff"), t("profile.botTeamArg"), t("profile.botTeamPinned")]}
              value={
                draft.team_mode === "arg"
                  ? t("profile.botTeamArg")
                  : draft.team_mode === "pinned"
                    ? t("profile.botTeamPinned")
                    : t("profile.botTeamOff")
              }
              onChange={value =>
                setDraft({
                  ...draft,
                  team_mode:
                    value === t("profile.botTeamArg") ? "arg" : value === t("profile.botTeamPinned") ? "pinned" : "off",
                })
              }
            />
            {draft.team_mode === "pinned" ? (
              <Select
                name='bot-team-id'
                label={t("profile.botTeamPick")}
                options={teams.map(item => `${item.name} (${item.slug})`)}
                value={
                  teams.find(item => item.id === draft.team_id)
                    ? `${teams.find(item => item.id === draft.team_id)?.name} (${teams.find(item => item.id === draft.team_id)?.slug})`
                    : ""
                }
                onChange={value => {
                  const picked = teams.find(item => `${item.name} (${item.slug})` === value);
                  setDraft({ ...draft, team_id: picked?.id ?? null });
                }}
              />
            ) : null}
            <Select
              name='bot-time'
              label={t("profile.botTime")}
              options={[t("profile.botTimeOff"), t("profile.botTimeOptional"), t("profile.botTimeRequired")]}
              value={
                draft.time_mode === "optional"
                  ? t("profile.botTimeOptional")
                  : draft.time_mode === "required"
                    ? t("profile.botTimeRequired")
                    : t("profile.botTimeOff")
              }
              onChange={value => {
                const time_mode =
                  value === t("profile.botTimeOptional")
                    ? "optional"
                    : value === t("profile.botTimeRequired")
                      ? "required"
                      : "off";
                setDraft({
                  ...draft,
                  time_mode,
                  time_default: time_mode === "off" ? null : (draft.time_default ?? "16:00"),
                });
              }}
            />
            {draft.time_mode !== "off" ? (
              <Select
                name='bot-time-default'
                label={t("profile.botTimeDefault")}
                options={CLOCKS}
                value={draft.time_default ?? "16:00"}
                onChange={value => setDraft({ ...draft, time_default: value })}
              />
            ) : null}
            <div className={styles.BotTemplates__Window}>
              <Select
                name='bot-window-start'
                label={t("profile.botWindowStart")}
                options={CLOCKS}
                value={draft.window_start}
                disabledFunc={value => value >= draft.window_end}
                onChange={value => setDraft({ ...draft, window_start: value })}
              />
              <Select
                name='bot-window-end'
                label={t("profile.botWindowEnd")}
                options={CLOCKS}
                value={draft.window_end}
                disabledFunc={value => value <= draft.window_start}
                onChange={value => setDraft({ ...draft, window_end: value })}
              />
            </div>
            <p className={styles.BotTemplates__Preview}>{preview}</p>
            {formError ? <p className={styles.BotTemplates__Error}>{formError}</p> : null}
            <div className={styles.BotTemplates__Actions}>
              <button
                type='button'
                className='baseButton mainButton'
                disabled={saving || Boolean(formError)}
                onClick={() => void saveDraft()}
              >
                {t("profile.botTemplatesSave")}
              </button>
              {templates.some(item => item.id === draft.id) ? (
                <button
                  type='button'
                  className='baseButton outlineButton'
                  disabled={saving}
                  onClick={() => void remove(draft.id)}
                >
                  {t("profile.botTemplatesDelete")}
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </ModalWrapper>
    </section>
  );
};
