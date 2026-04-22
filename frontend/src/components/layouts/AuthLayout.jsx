import styles from "./AuthLayout.module.css"

const AuthLayout = ({ children, uiImage }) => {
	return (
		<div className="flex overflow-hidden">
			{/* Form */}
			<div className="w-screen h-screen md:w-[60vw] px-12 pt-8 pb-12">
				<h2 className="text-7xl font-semibold text-[#484bf2]">Taskly</h2>
				{children}
			</div>

			{/* Vertical line */}
			<div className="hidden md:flex w-[50vw] h-screen items-center justify-center overflow-hidden">
				<div className="h-screen w-10 bg-[#2124d6] relative overflow-hidden">
					<div className="absolute inset-0 bg-linear-to-l from-[#484bf2] to-[#f4f7fb]"></div>-
				</div>

				{/* Img */}
				<img src={uiImage} alt="UI Image" className={`w-65 lg:w-[90%] ${styles.floating}`} />
			</div>
			<style>
				{`
    				@keyframes float {
     					0%, 100% { transform: translateY(px); }
      					50% { transform: translateY(-40px); }
   					}
  				`}
			</style>
		</div>
	)
}

export default AuthLayout