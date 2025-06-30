import { useEffect } from "react";

const ExternalRedirect = ({ url }) => {
    useEffect(() => {
        window.location.href = url; // Mengarahkan ke URL eksternal
    }, [url]);
    
    return null; // Tidak ada elemen yang perlu dirender
};

export default ExternalRedirect;
