import { apiClient } from "@/shared/api";
import type { ITeam, ITeamPayload } from "../model/Team.types";

type RawTeam = ITeam & {
  has_photo?: boolean;
  is_owner?: boolean;
};

const normalizeTeam = (raw: RawTeam): ITeam => ({
  ...raw,
  description: raw.description ?? "",
  hasPhoto: raw.hasPhoto ?? raw.has_photo ?? false,
  isOwner: raw.isOwner ?? raw.is_owner ?? false,
  members: raw.members ?? [],
});

export const listTeamsRequest = async () => {
  const data = await apiClient.get<RawTeam[]>("/teams");
  return data.map(normalizeTeam);
};

export const getTeamRequest = async (id: number) => {
  const data = await apiClient.get<RawTeam>(`/teams/${id}`);
  return normalizeTeam(data);
};

export const createTeamRequest = async (payload: ITeamPayload) => {
  const data = await apiClient.post<RawTeam, ITeamPayload>("/teams", payload);
  return normalizeTeam(data);
};

export const updateTeamRequest = async (id: number, payload: ITeamPayload) => {
  const data = await apiClient.patch<RawTeam, ITeamPayload>(`/teams/${id}`, payload);
  return normalizeTeam(data);
};

export const deleteTeamRequest = (id: number) => {
  return apiClient.delete(`/teams/${id}`);
};

export const uploadTeamPhotoRequest = async (id: number, file: File) => {
  const body = new FormData();
  body.append("file", file);
  const data = await apiClient.postFormData<RawTeam>(`/teams/${id}/photo`, body);
  return normalizeTeam(data);
};
