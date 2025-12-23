import { useEffect } from "react";

/**
 * RobotsMetaTag - Dynamic indexing control based on environment
 * 
 * Staging (VITE_ENVIRONMENT=staging): Adds noindex, nofollow meta tags
 * Production (VITE_ENVIRONMENT=production): Removes noindex meta tags, allows indexing
 * 
 * This component manages the meta robots tag dynamically at runtime,
 * complementing the server-side X-Robots-Tag header.
 */
export function RobotsMetaTag() {
  const environment = import.meta.env.VITE_ENVIRONMENT || "staging";
  const isStaging = environment === "staging";

  useEffect(() => {
    // Find or create the robots meta tag
    let robotsMeta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    let googlebotMeta = document.querySelector('meta[name="googlebot"]') as HTMLMetaElement | null;

    if (isStaging) {
      // Staging: ensure noindex tags exist
      if (!robotsMeta) {
        robotsMeta = document.createElement("meta");
        robotsMeta.name = "robots";
        document.head.appendChild(robotsMeta);
      }
      robotsMeta.content = "noindex, nofollow";

      if (!googlebotMeta) {
        googlebotMeta = document.createElement("meta");
        googlebotMeta.name = "googlebot";
        document.head.appendChild(googlebotMeta);
      }
      googlebotMeta.content = "noindex, nofollow";
    } else {
      // Production: remove noindex tags to allow indexing
      if (robotsMeta) {
        robotsMeta.remove();
      }
      if (googlebotMeta) {
        googlebotMeta.remove();
      }
    }

    // Cleanup on unmount (though this component should stay mounted)
    return () => {
      // Don't remove on unmount - let the tags persist
    };
  }, [isStaging]);

  // This component doesn't render anything visible
  return null;
}

export default RobotsMetaTag;
