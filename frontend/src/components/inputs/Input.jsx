import { useState } from "react"
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6"

const Input = ({ value, onChange, label, placeholder, type, onFocus }) => {

	const [showPassword, setShowPassword] = useState(false);

	const toggleShowPassword = () => {
		setShowPassword(!showPassword);
	}

	return (
		<div>
			<label className="text-[13px] text-slate-800">{label}</label>
			<div className="input-box">
				<input
					type={type == 'password' ? (showPassword ? 'text' : 'password') : type}
					value={value}
					onChange={(e) => onChange(e)}
					placeholder={placeholder}
					onFocus={onFocus}
					className="w-full bg-transparent outline-none"
				/>
				{type == "password" && (
					<>
						{showPassword ? (
							<FaRegEye
								size={22}
								className="text-[#484bf2] cursor-pointer"
								onClick={() => toggleShowPassword()}
							/>
						) : (
							<FaRegEyeSlash
								size={22}
								className="text-slate-500 cursor-pointer"
								onClick={() => toggleShowPassword()}
							/>
						)}
					</>
				)}
			</div>
		</div>
	)
}
export default Input