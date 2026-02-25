import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
    return (
        <SignUp
            appearance={{
                elements: {
                    rootBox: "w-full mx-auto",
                    card: "bg-white/90 backdrop-blur-xl shadow-2xl border-0 rounded-2xl w-full max-w-md mx-auto p-1",
                    headerTitle: "text-2xl font-bold tracking-tight text-black",
                    headerSubtitle: "text-gray-500",
                    socialButtonsBlockButton: "border-gray-200 hover:bg-gray-50 bg-white transition-all text-gray-600 rounded-xl h-11",
                    dividerLine: "bg-gray-200",
                    formFieldLabel: "text-gray-700 font-medium",
                    formFieldInput: "rounded-xl border-gray-200 h-11 focus:ring-2 focus:ring-black focus:border-black transition-all bg-white",
                    formButtonPrimary: "bg-black hover:bg-black/90 text-white rounded-xl h-11 transition-all font-medium",
                    footerActionText: "text-gray-500",
                    footerActionLink: "text-black font-semibold hover:text-black"
                }
            }}
        />
    );
}
