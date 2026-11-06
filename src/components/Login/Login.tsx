import { Form } from 'informed'
import { Link } from 'react-router-dom'
import { LuArrowRight, LuCalendarDays, LuCheck, LuEye, LuEyeOff, LuFolderHeart, LuLeaf, LuLockKeyhole, LuMail, LuSprout, LuUsers } from 'react-icons/lu'
import Input from '../Input'
import styles from './Login.module.css'
import { useLogin } from './useLogin'

export default function Login() {
  const { showPassword, notice, handleSubmit, handleRecovery, togglePassword } = useLogin()

  return (
    <main className={styles.page}>
      <section className={styles.story} aria-labelledby="story-title">
        <Link className={styles.brand} to="/login" aria-label="Nutriline, ir al inicio de sesión">
          <span className={styles.brandIcon}><LuSprout aria-hidden="true" /></span>
          Nutriline<span className={styles.brandDot}>.</span>
        </Link>

        <div className={styles.storyContent}>
          <span className={styles.eyebrow}><span /> HECHO PARA TU CONSULTA</span>
          <h1 id="story-title">Más cerca de tus pacientes.<br /><span>Más espacio para cuidar.</span></h1>
          <p className={styles.storyDescription}>Tu práctica nutricional, en un solo lugar. Organiza cada consulta y acompaña cada paso de tus pacientes.</p>

          <div className={styles.illustration} aria-hidden="true">
            <div className={styles.orbit} />
            <div className={styles.leafBadge}><LuLeaf /></div>
            <div className={styles.previewCard}>
              <div className={styles.previewHeader}>
                <span className={styles.previewIcon}><LuFolderHeart /></span>
                <div><strong>Cuidado que conecta</strong><span>Cada historia merece atención</span></div>
                <LuCheck className={styles.check} />
              </div>
              <div className={styles.previewLine} /><div className={styles.previewLineShort} />
              <div className={styles.previewFooter}><span><LuUsers /> Pacientes</span><span><LuCalendarDays /> Consultas</span></div>
            </div>
            <div className={styles.floatingNote}><span><LuCheck /></span> Un seguimiento más humano</div>
          </div>
        </div>

        <p className={styles.storyFooter}>Organización para ti. Bienestar para ellos.</p>
      </section>

      <section className={styles.access} aria-labelledby="login-title" id="login">
        <div className={styles.mobileBrand}><LuSprout aria-hidden="true" /> Nutriline.</div>
        <div className={styles.formContainer}>
          <span className={styles.welcomeIcon}><LuLeaf aria-hidden="true" /></span>
          <p className={styles.kicker}>TU ESPACIO DE TRABAJO</p>
          <h2 id="login-title">Qué gusto verte de nuevo</h2>
          <p className={styles.subtitle}>Inicia sesión para continuar con tu consulta.</p>

          <Form onSubmit={handleSubmit} className={styles.form}>
            <Input identifier="email" label="Correo electrónico" type="email" autoComplete="username"
              placeholder="tu@correo.com" required
              before={<LuMail aria-hidden="true" />} classes={{ input: styles.field, label: styles.label, root: styles.fieldRoot }} />
            <div className={styles.passwordGroup}>
              <Input identifier="password" label="Contraseña" type={showPassword ? 'text' : 'password'}
                autoComplete="current-password" placeholder="Ingresa tu contraseña" required
                before={<LuLockKeyhole aria-hidden="true" />}
                after={<button type="button" className={styles.passwordToggle} onClick={togglePassword}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={showPassword}>
                   <LuEyeOff aria-hidden="true" className={showPassword ? styles.visibleIcon : styles.hiddenIcon} />
                   <LuEye aria-hidden="true" className={showPassword ? styles.hiddenIcon : styles.visibleIcon} />
                </button>}
                classes={{ input: styles.field, label: styles.label, root: styles.fieldRoot }} />
              <button type="button" className={styles.recovery} onClick={handleRecovery}>¿Olvidaste tu contraseña?</button>
            </div>
            <button type="submit" className={styles.submit}>Iniciar sesión <LuArrowRight aria-hidden="true" /></button>
            <div role="status" className={notice ? styles.notice : styles.emptyNotice}>{notice}</div>
          </Form>

          <p className={styles.previewNotice}>Vista previa de la interfaz · Acceso aún no conectado</p>
          <Link to="/dashboard/pacientes" className={styles.demoLink}>Explorar pacientes de demostración <LuArrowRight aria-hidden="true" /></Link>
        </div>
        <footer className={styles.footer}>Nutriline <span aria-hidden="true">·</span> Gestión nutricional con propósito</footer>
      </section>
    </main>
  )
}
