import { useQuery } from "@tanstack/react-query";
import { listTeamsRequest } from "@/entities/Team";
import { useSessionStore } from "@/entities/User";
import { useTranslation } from "@/shared/i18n";
import { teamPhotoUrl } from "@/shared/ui";
import styles from "./TeamSelect.module.css";
import { useCreateMeetStore } from "../../model";

export const TeamSelect = () => {
  const { t } = useTranslation();
  const user = useSessionStore(state => state.user);
  const teamId = useCreateMeetStore(state => state.values.teamId);
  const setTeamId = useCreateMeetStore(state => state.setTeamId);
  const { data: teams = [] } = useQuery({
    queryKey: ["teams"],
    queryFn: listTeamsRequest,
    enabled: Boolean(user),
  });

  if (!user || teams.length === 0) {
    return null;
  }

  const selected = teams.find(item => item.id === teamId) ?? null;

  return (
    <div className={styles.TeamSelect}>
      <span className={styles.TeamSelect__Label}>{t("create.team")}</span>
      <div className={styles.TeamSelect__List}>
        <button
          type='button'
          className={`${styles.TeamSelect__Option} ${teamId == null ? styles.TeamSelect__Option_active : ""}`}
          onClick={() => setTeamId(null)}
        >
          {t("create.teamNone")}
        </button>
        {teams.map(team => (
          <button
            key={team.id}
            type='button'
            className={`${styles.TeamSelect__Option} ${teamId === team.id ? styles.TeamSelect__Option_active : ""}`}
            onClick={() => setTeamId(team.id)}
          >
            {team.hasPhoto ? (
              <img src={teamPhotoUrl(team.id)} alt='' className={styles.TeamSelect__Photo} />
            ) : (
              <span className={styles.TeamSelect__PhotoFallback}>{team.name.slice(0, 1)}</span>
            )}
            <span className={styles.TeamSelect__Name}>{team.name}</span>
          </button>
        ))}
      </div>
      {selected ? (
        <p className={styles.TeamSelect__Hint}>
          {t("create.teamHint", { count: selected.members.length, name: selected.name })}
        </p>
      ) : null}
    </div>
  );
};
