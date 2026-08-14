import { getMeetPermissions } from "@/entities/Meet";
import styles from "./MeetPrivacy.module.css";
import { useUpdateMeetSettings } from "../../api";
import type { IMeet } from "@/entities/Meet";

interface MeetPrivacyProps {
  hash: string;
  data: IMeet;
}

export const MeetPrivacy = ({ hash, data }: MeetPrivacyProps) => {
  const permissions = getMeetPermissions(data);
  const { mutate, isPending } = useUpdateMeetSettings(hash);

  if (!permissions.canEditSettings) {
    return null;
  }

  const save = (
    patch: Partial<
      Pick<IMeet, "anyoneCanEdit" | "anyoneCanDeleteParticipants" | "requireLoginToVote" | "anyoneCanSetFinal">
    >,
  ) => {
    mutate({
      anyoneCanEdit: patch.anyoneCanEdit ?? data.anyoneCanEdit,
      anyoneCanDeleteParticipants: patch.anyoneCanDeleteParticipants ?? data.anyoneCanDeleteParticipants,
      requireLoginToVote: patch.requireLoginToVote ?? data.requireLoginToVote,
      anyoneCanSetFinal: patch.anyoneCanSetFinal ?? data.anyoneCanSetFinal,
    });
  };

  return (
    <section className={styles.MeetPrivacy}>
      <h3 className={styles.MeetPrivacy__Title}>Кто может что делать</h3>
      <PrivacyRow
        label='Редактировать данные встречи могут все'
        checked={data.anyoneCanEdit}
        disabled={isPending}
        onToggle={() => save({ anyoneCanEdit: !data.anyoneCanEdit })}
      />
      <PrivacyRow
        label='Удалять участников встречи могут все'
        checked={data.anyoneCanDeleteParticipants}
        disabled={isPending}
        onToggle={() => save({ anyoneCanDeleteParticipants: !data.anyoneCanDeleteParticipants })}
      />
      <PrivacyRow
        label='Голосовать могут только с аккаунтом'
        checked={data.requireLoginToVote}
        disabled={isPending}
        onToggle={() => save({ requireLoginToVote: !data.requireLoginToVote })}
      />
      <PrivacyRow
        label='Итоговое время могут назначать все, у кого есть аккаунт'
        checked={data.anyoneCanSetFinal}
        disabled={isPending}
        onToggle={() => save({ anyoneCanSetFinal: !data.anyoneCanSetFinal })}
      />
    </section>
  );
};

const PrivacyRow = ({
  label,
  checked,
  disabled,
  onToggle,
}: {
  label: string;
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
}) => {
  return (
    <label className={styles.MeetPrivacy__Row}>
      <span>{label}</span>
      <button
        type='button'
        role='switch'
        aria-checked={checked}
        aria-label={label}
        className={`${styles.MeetPrivacy__Switch} ${checked ? styles.MeetPrivacy__Switch_on : ""}`}
        disabled={disabled}
        onClick={onToggle}
      />
    </label>
  );
};
