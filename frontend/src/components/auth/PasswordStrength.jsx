'use client';

function getStrength(password) {
  if (!password) return { score: 0, label: '', color: 'bg-gray-200', textColor: 'text-gray-400' };
  const passed = ['min8', 'upper', 'lower', 'digit', 'symbol'].filter((k) => {
    if (k === 'min8') return password.length >= 8;
    if (k === 'upper') return /[A-Z]/.test(password);
    if (k === 'lower') return /[a-z]/.test(password);
    if (k === 'digit') return /\d/.test(password);
    if (k === 'symbol') return /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return false;
  }).length;
  const score = Math.min(passed, 5);
  if (score <= 1) return { score, label: 'Lemah', color: 'bg-red-500', textColor: 'text-red-500' };
  if (score <= 2) return { score, label: 'Sedang', color: 'bg-orange-500', textColor: 'text-orange-500' };
  if (score <= 3) return { score, label: 'Kuat', color: 'bg-yellow-500', textColor: 'text-yellow-500' };
  return { score, label: 'Sangat Kuat', color: 'bg-green-500', textColor: 'text-green-500' };
}

export default function PasswordStrength({ password }) {
  const { score, label, color, textColor } = getStrength(password);

  if (!password) return null;

  return (
    <div className="mt-1.5 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
            i <= score ? color : 'bg-gray-200'
          }`} />
        ))}
      </div>
      <p className={`text-[10px] font-medium ${textColor}`}>
        {label}{' '}
        <span className="text-gray-400 font-normal">— {score}/5</span>
      </p>
    </div>
  );
}
