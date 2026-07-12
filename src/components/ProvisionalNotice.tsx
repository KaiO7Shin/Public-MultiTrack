/** Bandeau : résultats provisoires tant que la course est en cours */
export function ProvisionalNotice() {
  return (
    <div
      className="mb-4 rounded-[10px] border border-sage/40 bg-sage-soft px-4 py-3 text-base text-sage-dark"
      role="status"
    >
      <p className="font-semibold">Résultats non définitifs</p>
      <p className="mt-0.5 leading-snug">
        La course est encore en cours. Le classement peut encore changer jusqu’à
        la fin de la course.
      </p>
    </div>
  );
}
