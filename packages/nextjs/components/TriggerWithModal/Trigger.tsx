/**
 * Triggers a modal with the corresponding ID when clicked.
 */

type TriggerProps = {
  id: string; // ID of the associated modal.
  children: React.ReactNode; // Content inside the trigger element (e.g. button, text).
  className?: string; // Optional classNames to be applied to the label.
};

const Trigger: React.FC<TriggerProps> = ({ id, children, className }) => {
  const labelClassName = `${className || ""}`; // Include provided classNames

  return (
    // Label that triggers the modal when clicked
    <label htmlFor={`modal-${id}`} className={labelClassName}>
      {children}
    </label>
  );
};

export default Trigger;
