import '../styles/BrandingHeader.css';
import { alamedaBranding } from '../config/branding';

export default function BrandingHeader() {
  const { county, department, appTitle, colors, logo } = alamedaBranding;

  return (
    <>
      {/* Header Section - ALAMEDA COUNTY & Human Resource Services */}
      <div className="branding-header" style={{ backgroundColor: colors.headerBg }}>
        <div className="branding-header-content">
          {/* County and Department Info */}
          <div className="branding-header-text">
            <h1 className="branding-county">{county}</h1>
            <p className="branding-department">{department}</p>
          </div>

          {/* Logo Icon - Display the uploaded logo */}
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

      {/* App Title Section - Benefits Enrollment Assistant */}
      <div className="branding-title-section" style={{ backgroundColor: colors.titleBg }}>
        <h2 className="branding-app-title">{appTitle}</h2>
      </div>
    </>
  );
}
