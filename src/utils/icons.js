// Smart, minimal icon that adapts to condition (Clear, Clouds, Rain, Snow, Thunderstorm, Drizzle, Mist/Fog)
// plus temperature to subtly change color hues. No heavy gradients; simple shapes with light animation.
// Usage: <SmartIcon temp={27} condition="Clear" size={110} />

export const SmartIcon = ({ temp = 24, condition = 'Clear', size = 110, animated = true }) => {
  // Base color hue by temperature
  // colder -> blue, warm -> orange/red
  const hue = temp <= 0 ? 200 : temp <= 10 ? 210 : temp <= 20 ? 190 : temp <= 30 ? 40 : 15;
  const primary = `hsl(${hue} 90% 55%)`;
  const muted = `hsl(${hue} 60% 80%)`;
  const stroke = `hsl(${hue} 70% 45%)`;

  const motion = animated ? 1 : 0;

  const Sun = () => (
    <g>
      <circle cx="32" cy="32" r="12" fill={primary} />
      <g stroke={primary} strokeWidth="3" strokeLinecap="round">
        <path d="M32 6v8M32 50v8M6 32h8M50 32h8M12 12l6 6M46 46l6 6M12 52l6-6M46 18l6-6">
          {motion ? <animateTransform attributeName="transform" type="rotate" from="0 32 32" to="360 32 32" dur="10s" repeatCount="indefinite" /> : null}
        </path>
      </g>
    </g>
  );

  const Cloud = () => (
    <g>
      <ellipse cx="28" cy="36" rx="16" ry="9" fill={muted} />
      <ellipse cx="42" cy="36" rx="12" ry="8" fill={muted} />
      {motion ? <animateTransform attributeName="transform" type="translate" values="0;0 0;0" dur="4s" repeatCount="indefinite" /> : null}
    </g>
  );

  const Rain = () => (
    <g>
      <Cloud />
      {[18, 28, 38, 48].map((x, i) => (
        <line key={i} x1={x} y1="42" x2={x - 2} y2="52" stroke={stroke} strokeWidth="2" strokeLinecap="round">
          {motion ? <animate attributeName="y1" values="42;52" dur={`${0.9 + i * 0.1}s`} repeatCount="indefinite" /> : null}
        </line>
      ))}
    </g>
  );

  const Snow = () => (
    <g>
      <Cloud />
      {[20, 30, 40, 50].map((x, i) => (
        <circle key={i} cx={x} cy="46" r="2" fill={stroke}>
          {motion ? <animate attributeName="cy" values="46;56" dur={`${1.2 + i * 0.1}s`} repeatCount="indefinite" /> : null}
        </circle>
      ))}
    </g>
  );

  const Thunder = () => (
    <g>
      <Cloud />
      <path d="M34 40l-6 12h6l-2 10 8-14h-6l4-8z" fill={primary} opacity="0.9">
        {motion ? <animate attributeName="opacity" values="0.3;1;0.3" dur="1.2s" repeatCount="indefinite" /> : null}
      </path>
    </g>
  );

  const Fog = () => (
    <g>
      <Cloud />
      {[40, 46, 52].map((y, i) => (
        <line key={i} x1="16" y1={y} x2="48" y2={y} stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      ))}
    </g>
  );

  const choose = () => {
    const c = (condition || '').toLowerCase();
    if (c.includes('thunder')) return <Thunder />;
    if (c.includes('snow')) return <Snow />;
    if (c.includes('rain')) return <Rain />;
    if (c.includes('drizzle')) return <Rain />;
    if (c.includes('mist') || c.includes('fog') || c.includes('haze')) return <Fog />;
    if (c.includes('cloud')) return <Cloud />;
    return <Sun />; // default clear
  };

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-label={`${condition} icon`}>
      {/* subtle baseline shadow to lift icon (no heavy gradient) */}
      <ellipse cx="32" cy="58" rx="18" ry="3" fill="black" opacity="0.08" />
      {choose()}
    </svg>
  );
};
