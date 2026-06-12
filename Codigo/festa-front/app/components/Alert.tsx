type AlertVariant = "error" | "success" | "info" | "warning";

const VARIANT_STYLES: Record<AlertVariant, string> = {
  error: "bg-red-50 text-red-600 border-red-100",
  success: "bg-green-50 text-green-700 border-green-100",
  info: "bg-blue-50 text-blue-700 border-blue-100",
  warning: "bg-yellow-50 text-yellow-700 border-yellow-100",
};

export function Alert({
  variant = "error",
  message,
  className = "",
}: {
  variant?: AlertVariant;
  message: string;
  className?: string;
}) {
  return (
    <p
      className={`rounded-md border px-3 py-2 text-sm ${VARIANT_STYLES[variant]} ${className}`.trim()}
    >
      {message}
    </p>
  );
}

export function FieldError({ message }: { message: string }) {
  return <p className="text-xs text-red-500">{message}</p>;
}
