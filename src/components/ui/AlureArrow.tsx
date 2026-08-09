/**
 * La flèche Alure, en SVG inline.
 *
 * Inline plutôt que `next/image` : c'est un vecteur décoratif qui couvre le hero.
 * `next/image` refuse les SVG sans `dangerouslyAllowSVG` — un réglage qui ouvrirait
 * l'optimiseur à des SVG distants, alors qu'on n'a besoin que de celui-ci. Inline,
 * il n'y a aucune requête, aucun décalage de mise en page, et la couleur suit
 * `currentColor`.
 *
 * Source : `public/logo/alure-fleche-1.svg` (charte V.02). Les deux doivent rester
 * identiques — celui de `public/` sert aux usages externes (réseaux, favicon).
 */
export function AlureArrow({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 981 157"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M594 0L699 20L767 29L808 37L892 46L969 49L979 52L981 57L965 68L952 71L866 80L754 101L649 117L563 135L535 136L532 135L531 131L548 114L559 110L569 103L571 99L566 98L548 103L421 122L341 140L223 157L189 155L187 151L188 143L203 139L245 119L271 110L278 106L277 103L239 103L199 108L166 108L161 110L33 121L20 121L12 116L0 113L2 104L9 100L49 92L89 79L167 50L175 44L184 41L287 41L381 38L543 40L570 36L610 34L611 31L607 27L583 12L585 4L589 4ZM678 31L676 32L677 46L672 50L664 50L657 45L649 44L600 51L540 56L379 54L331 57L199 57L113 83L108 85L107 88L224 83L344 83L356 78L367 78L374 84L374 93L299 119L294 124L310 124L348 115L389 110L486 92L614 76L621 73L634 74L639 80L638 85L633 85L630 94L620 99L620 102L624 103L675 93L883 62L882 59L764 47L699 37Z"
      />
    </svg>
  )
}
