function athletePath(
  raceId: number,
  participantId: number,
  phaseId?: number | null
): string {
  const base = `/course/${raceId}/coureur/${participantId}`;
  if (phaseId != null && phaseId > 0) {
    return `${base}?phase=${phaseId}`;
  }
  return base;
}

export { athletePath };
