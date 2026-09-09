import '../styles/BrandingHeader.css';
import { alamedaBranding } from '../config/branding';

export default function BrandingHeader() {
  const { county, department, colors } = alamedaBranding;

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
        </div>
      </div>

      {/* App Title Section - Benefits Enrollment Assistant - REMOVED */}
    </>
  );
}
