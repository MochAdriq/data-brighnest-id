export default function ApplicationLogo({ className = "", ...props }) {
    return (
        <img
            {...props}
            src="/images/brightnest_company.png"
            alt="Brightnest"
            className={className}
        />
    );
}
