import '../styles/BrandingHeader.css';
import { alamedaBranding } from '../config/branding';

export default function BrandingHeader() {
  const { county, department, appTitle, colors, logo } = alamedaBranding;

  return (
    <>
      {/* Header Section */}
      <div className="branding-header" style={{ backgroundColor: colors.headerBg }}>
        <div className="branding-header-content">
          {/* County and Department Info */}
          <div className="branding-header-text">
            <h1 className="branding-county">{county}</h1>
            <p className="branding-department">{department}</p>
          </div>

          {/* Logo Icon */}
          <div
            className="branding-logo"
            style={{
              backgroundColor: colors.iconBg,
              color: colors.iconColor,
            }}
          >
            {logo.type === 'icon' ? logo.content : <img src={logo.content} alt="County Logo" />}
          </div>
        </div>
      </div>

      {/* Separator Line */}
      <div
        className="branding-separator"
        style={{ backgroundColor: colors.separatorColor }}
      />

      {/* App Title Section */}
      <div className="branding-title-section" style={{ backgroundColor: colors.headerBg }}>
        <h2 className="branding-app-title">{appTitle}</h2>
      </div>
    </>
  );
}
