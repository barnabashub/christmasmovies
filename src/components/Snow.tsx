const FLAKES = Array.from({ length: 48 }, (_, i) => ({
  left: (i * 37) % 100,
  size: 2 + ((i * 7) % 5),
  duration: 9 + ((i * 13) % 12),
  delay: -((i * 17) % 20),
  drift: ((i * 11) % 30) - 15,
}))

export function Snow() {
  return (
    <div className="snow" aria-hidden>
      {FLAKES.map((flake, i) => (
        <span
          key={i}
          style={{
            left: `${flake.left}%`,
            width: flake.size,
            height: flake.size,
            animationDuration: `${flake.duration}s`,
            animationDelay: `${flake.delay}s`,
            ['--drift' as string]: `${flake.drift}vw`,
          }}
        />
      ))}
    </div>
  )
}
