export const canManageMeeting = (isCreator: boolean, isCreatorAuth: boolean) => {
  return isCreator || !isCreatorAuth;
};
