const controlClass = 'w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#484bf2]/20 focus:border-[#484bf2] transition-colors placeholder-gray-400';

export const FieldLabel = ({ children, required = false }) => (
	<label className="block text-sm font-medium text-gray-700 mb-1.5">
		{children} {required && <span className="text-rose-500">*</span>}
	</label>
);

export const FormInput = ({ className = '', ...props }) => (
	<input {...props} className={`${controlClass} ${className}`} />
);

export const FormTextarea = ({ className = '', ...props }) => (
	<textarea {...props} className={`${controlClass} resize-none ${className}`} />
);

export const FormSelect = ({ children, className = '', ...props }) => (
	<select {...props} className={`${controlClass} bg-white text-gray-700 ${className}`}>
		{children}
	</select>
);

export const FieldError = ({ message }) =>
	message ? <p className="mt-1 text-xs text-rose-500">{message}</p> : null;
