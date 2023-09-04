/* eslint-disable @typescript-eslint/no-misused-promises */
import './footerCss.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

function Footer() {
  const { t, i18n } = useTranslation();

  const changeLanguage = async (lng: string | undefined) => {
    await i18n.changeLanguage(lng);
  };

  return (
    <footer className="Footer_footer">
      <div className="iconfont" onClick={() => changeLanguage('en')}>
        <FontAwesomeIcon icon={faGlobe} style={{ height: '20px' }} />
      </div>
      <div className="Footer_copyright">{t('footer.copyright')}</div>
    </footer>
  );
}

export default Footer;