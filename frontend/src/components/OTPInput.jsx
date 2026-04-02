import { useEffect, useRef } from 'react';

function OTPInput({ length = 6, value, onChange }) {
  const inputRefs = useRef([]);
  const digits = Array.from({ length }, (_, index) => value[index] || '');

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  function updateValue(nextDigits) {
    onChange(nextDigits.join('').slice(0, length));
  }

  function handleChange(index, event) {
    const nextChar = event.target.value.replace(/\D/g, '').slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = nextChar;
    updateValue(nextDigits);

    if (nextChar && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      inputRefs.current[index + 1]?.select();
    }
  }

  function handleKeyDown(index, event) {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      const nextDigits = [...digits];
      nextDigits[index - 1] = '';
      updateValue(nextDigits);
      inputRefs.current[index - 1]?.focus();
      inputRefs.current[index - 1]?.select();
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handlePaste(index, event) {
    event.preventDefault();
    const pastedDigits = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, length - index).split('');

    if (pastedDigits.length === 0) {
      return;
    }

    const nextDigits = [...digits];
    pastedDigits.forEach((digit, offset) => {
      nextDigits[index + offset] = digit;
    });
    updateValue(nextDigits);

    const nextFocusIndex = Math.min(index + pastedDigits.length, length - 1);
    inputRefs.current[nextFocusIndex]?.focus();
    inputRefs.current[nextFocusIndex]?.select();
  }

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(node) => {
            inputRefs.current[index] = node;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(event) => handleChange(index, event)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={(event) => handlePaste(index, event)}
          className="h-14 w-12 rounded-xl border border-surface-300 text-center text-xl font-semibold text-ink-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
        />
      ))}
    </div>
  );
}

export default OTPInput;