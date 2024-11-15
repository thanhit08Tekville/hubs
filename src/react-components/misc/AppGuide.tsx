import React from "react";

import configs from "../../utils/configs";

export function AppGuide({ className }: { className?: string }) {
    const guideLogo = "useGuide()";

    return (
        <img className={className} alt={configs.translation("app-name")} src={guideLogo} />
    );
}
