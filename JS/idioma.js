// ============================================================
// IDIOMA (Español / English / Português) + SINCRONÍA CON index.html
//
// - Lee el idioma que el usuario eligió en index.html (localStorage "idioma").
// - Lee el tema que dejó en index.html (localStorage "tema": claro / oscuro)
//   y lo pasa al tema del login (tl_tema) ANTES de pintar la página
//   (eso lo hace el script del <head> de login.html).
// - Si el usuario cambia el idioma o el tema aquí, también se guarda
//   para index.html (misma clave), así queda igual en ambos lados.
//
// Funciona sin tocar login.js, institucion.js, verificacion.js, etc.:
// el HTML y los scripts siguen escribiendo en español y este archivo
// traduce los textos (también los que se crean después, como avisos,
// mensajes de error, calendario o la lista de instituciones).
//
// Cargar AL FINAL, después de tema.js.
//
// Para agregar textos que falten:
//   TL_I18N.agregar({ "Texto en español": ["English text", "Texto em português"] });
// ============================================================

(function () {

    "use strict";

    // ---------- Claves compartidas con index.html ----------

    const CLAVE_IDIOMA = "idioma";      // "es" | "en" | "pt"  (igual que script.js del index)
    const CLAVE_TEMA_INDEX = "tema";    // "claro" | "oscuro"  (igual que script.js del index)
    const CLAVE_TEMA_LOGIN = "tl_tema"; // "light" | "dark"    (la que usa tema.js del login)

    const IDIOMAS = ["es", "en", "pt"];

    const POSICION = { en: 0, pt: 1 };

    // Se declara aquí arriba porque agregar() la usa mientras se carga el diccionario
    let idioma = "es";


    // =============================
    // DICCIONARIO
    // La clave es el texto original en español.
    // El valor es [inglés, portugués].
    // =============================

    const DICCIONARIO = new Map();

    function normalizar(texto) {

        return String(texto).replace(/\s+/g, " ").trim();

    }

    function agregar(objeto) {

        Object.keys(objeto).forEach(function (clave) {

            DICCIONARIO.set(normalizar(clave), objeto[clave]);

        });

        if (idioma !== "es") {
            recorrer(document.body);
        }

    }


    // ---------- Países ----------

    const PAISES = {
        "Colombia": ["Colombia", "Colômbia"],
        "Estados Unidos": ["United States", "Estados Unidos"],
        "México": ["Mexico", "México"],
        "España": ["Spain", "Espanha"],
        "Argentina": ["Argentina", "Argentina"],
        "Brasil": ["Brazil", "Brasil"],
        "Chile": ["Chile", "Chile"],
        "Perú": ["Peru", "Peru"],
        "Venezuela": ["Venezuela", "Venezuela"],
        "Ecuador": ["Ecuador", "Equador"],
        "Bolivia": ["Bolivia", "Bolívia"],
        "Paraguay": ["Paraguay", "Paraguai"],
        "Uruguay": ["Uruguay", "Uruguai"],
        "Panamá": ["Panama", "Panamá"],
        "Costa Rica": ["Costa Rica", "Costa Rica"],
        "El Salvador": ["El Salvador", "El Salvador"],
        "Guatemala": ["Guatemala", "Guatemala"],
        "Honduras": ["Honduras", "Honduras"],
        "Nicaragua": ["Nicaragua", "Nicarágua"],
        "Cuba": ["Cuba", "Cuba"]
    };

    function nombrePais(nombre, i) {

        const entrada = PAISES[nombre];

        return entrada ? entrada[POSICION[i]] : nombre;

    }


    // ---------- Meses y roles (para los textos con variables) ----------

    const MESES = {
        "Enero": ["January", "Janeiro"],
        "Febrero": ["February", "Fevereiro"],
        "Marzo": ["March", "Março"],
        "Abril": ["April", "Abril"],
        "Mayo": ["May", "Maio"],
        "Junio": ["June", "Junho"],
        "Julio": ["July", "Julho"],
        "Agosto": ["August", "Agosto"],
        "Septiembre": ["September", "Setembro"],
        "Octubre": ["October", "Outubro"],
        "Noviembre": ["November", "Novembro"],
        "Diciembre": ["December", "Dezembro"]
    };

    const ROLES = {
        "los participantes": ["participants", "os participantes"],
        "los directores": ["directors", "os diretores"],
        "los administradores": ["administrators", "os administradores"],
        "este tipo de cuenta": ["this account type", "este tipo de conta"]
    };


    // ---------- Textos con partes variables ----------

    const PATRONES = [

        function (t, i) {
            const m = /^Máximo (\d+) dígitos para (.+)\.$/.exec(t);
            if (!m) { return null; }
            return i === "en"
                ? "Maximum " + m[1] + " digits for " + nombrePais(m[2], i) + "."
                : "Máximo de " + m[1] + " dígitos para " + nombrePais(m[2], i) + ".";
        },

        function (t, i) {
            const m = /^El número debe tener (\d+) dígitos para (.+)\.$/.exec(t);
            if (!m) { return null; }
            return i === "en"
                ? "The number must have " + m[1] + " digits for " + nombrePais(m[2], i) + "."
                : "O número deve ter " + m[1] + " dígitos para " + nombrePais(m[2], i) + ".";
        },

        function (t, i) {
            const m = /^Edad mínima: (\d+) años\.$/.exec(t);
            if (!m) { return null; }
            return i === "en"
                ? "Minimum age: " + m[1] + " years."
                : "Idade mínima: " + m[1] + " anos.";
        },

        function (t, i) {
            const m = /^Edad mínima para (.+): (\d+) años\.$/.exec(t);
            if (!m) { return null; }
            const rol = ROLES[m[1]] ? ROLES[m[1]][POSICION[i]] : m[1];
            return i === "en"
                ? "Minimum age for " + rol + ": " + m[2] + " years."
                : "Idade mínima para " + rol + ": " + m[2] + " anos.";
        },

        function (t, i) {
            const m = /^Dígito (\d+)$/.exec(t);
            if (!m) { return null; }
            return (i === "en" ? "Digit " : "Dígito ") + m[1];
        },

        function (t, i) {
            const m = /^(Enero|Febrero|Marzo|Abril|Mayo|Junio|Julio|Agosto|Septiembre|Octubre|Noviembre|Diciembre) (\d{4})$/.exec(t);
            if (!m) { return null; }
            return MESES[m[1]][POSICION[i]] + " " + m[2];
        }

    ];


    // ---------- Textos fijos ----------

    agregar({

        // Título y descripción de la página
        "TrueLock | Iniciar sesión": ["TrueLock | Sign in", "TrueLock | Entrar"],
        "TrueLock - Inicia sesión, recupera tu contraseña o crea una cuenta.": [
            "TrueLock - Sign in, recover your password or create an account.",
            "TrueLock - Entre, recupere sua senha ou crie uma conta."
        ],

        // Login
        "Control Parental Avanzado": ["Advanced Parental Control", "Controle Parental Avançado"],
        "Al continuar aceptas los": ["By continuing you accept the", "Ao continuar, você aceita os"],
        "Términos y Condiciones": ["Terms and Conditions", "Termos e Condições"],
        "Política de Privacidad": ["Privacy Policy", "Política de Privacidade"],
        "✉️ Correo": ["✉️ Email", "✉️ E-mail"],
        "📱 Teléfono": ["📱 Phone", "📱 Telefone"],
        "Correo Electrónico": ["Email Address", "E-mail"],
        "Número de Teléfono": ["Phone Number", "Número de Telefone"],
        "Número de teléfono": ["Phone number", "Número de telefone"],
        "Contraseña": ["Password", "Senha"],
        "Tu contraseña": ["Your password", "Sua senha"],
        "¿Olvidaste tu contraseña?": ["Forgot your password?", "Esqueceu sua senha?"],
        "Iniciar Sesión": ["Sign In", "Entrar"],
        "Iniciando sesión...": ["Signing in...", "Entrando..."],
        "¿No tienes cuenta?": ["Don't have an account?", "Não tem uma conta?"],
        "Regístrate aquí": ["Sign up here", "Cadastre-se aqui"],
        "Protección en Tiempo Real • 100% Seguro": ["Real-Time Protection • 100% Secure", "Proteção em Tempo Real • 100% Seguro"],
        "Mostrar contraseña": ["Show password", "Mostrar senha"],
        "Ocultar contraseña": ["Hide password", "Ocultar senha"],

        // Avisos del login
        "Por favor completa todos los campos.": ["Please fill in all the fields.", "Por favor, preencha todos os campos."],
        "Correo o contraseña incorrectos.": ["Incorrect email or password.", "E-mail ou senha incorretos."],
        "Teléfono o contraseña incorrectos.": ["Incorrect phone or password.", "Telefone ou senha incorretos."],
        "Tu cuenta no tiene un rol válido.": ["Your account does not have a valid role.", "Sua conta não tem um perfil válido."],
        "Primero debes verificar tu correo.": ["You must verify your email first.", "Primeiro você deve verificar seu e-mail."],

        // Recuperar contraseña
        "Recuperar Contraseña": ["Recover Password", "Recuperar Senha"],
        "Verifica tu identidad para restablecer tu contraseña.": [
            "Verify your identity to reset your password.",
            "Verifique sua identidade para redefinir sua senha."
        ],
        "Enviar enlace de recuperación": ["Send recovery link", "Enviar link de recuperação"],
        "Ingresa el número asociado a tu cuenta.": ["Enter the number linked to your account.", "Digite o número associado à sua conta."],
        "Verificar teléfono": ["Verify phone", "Verificar telefone"],
        "Volver al inicio de sesión": ["Back to sign in", "Voltar ao login"],
        "Ingresa tu correo electrónico.": ["Enter your email address.", "Digite seu e-mail."],
        "Te enviamos un enlace de recuperación a tu correo.": [
            "We sent a recovery link to your email.",
            "Enviamos um link de recuperação para o seu e-mail."
        ],
        "Te enviamos un código de verificación por SMS.": [
            "We sent a verification code by SMS.",
            "Enviamos um código de verificação por SMS."
        ],

        // Registro
        "Crear Cuenta": ["Create Account", "Criar Conta"],
        "Regístrate en TrueLock": ["Sign up for TrueLock", "Cadastre-se na TrueLock"],
        "Tipo de cuenta": ["Account type", "Tipo de conta"],
        "Participante": ["Participant", "Participante"],
        "Director": ["Director", "Diretor"],
        "Administrador": ["Administrator", "Administrador"],
        "Solo lectura de configuraciones": ["Read-only access to settings", "Somente leitura das configurações"],
        "Puede editar bloqueos y revisar reportes": ["Can edit blocks and review reports", "Pode editar bloqueios e revisar relatórios"],
        "Control total sobre usuarios y configuraciones": ["Full control over users and settings", "Controle total sobre usuários e configurações"],

        // Institución educativa (Director)
        "Institución educativa": ["Educational institution", "Instituição de ensino"],
        "Busca tu colegio, universidad o SENA": ["Search for your school, university or SENA", "Busque sua escola, universidade ou SENA"],
        "Escribe al menos 3 letras para buscar.": ["Type at least 3 letters to search.", "Digite pelo menos 3 letras para buscar."],
        "Mi institución no aparece en la lista": ["My institution is not in the list", "Minha instituição não aparece na lista"],
        "Para validar que tu institución existe, necesitamos un código oficial o un contacto institucional.": [
            "To validate that your institution exists, we need an official code or an institutional contact.",
            "Para validar que sua instituição existe, precisamos de um código oficial ou de um contato institucional."
        ],
        "Nombre completo de la institución": ["Full name of the institution", "Nome completo da instituição"],
        "Como aparece en su registro oficial": ["As it appears in its official record", "Como aparece no registro oficial"],
        "Tipo de institución": ["Institution type", "Tipo de instituição"],
        "Selecciona una opción": ["Select an option", "Selecione uma opção"],
        "Colegio / Escuela": ["School / High school", "Colégio / Escola"],
        "Universidad / Institución universitaria": ["University / University institution", "Universidade / Instituição universitária"],
        "Instituto técnico o tecnológico": ["Technical or technological institute", "Instituto técnico ou tecnológico"],
        "SENA (centro o regional)": ["SENA (center or regional office)", "SENA (centro ou regional)"],
        "Otro": ["Other", "Outro"],
        "Departamento": ["Department", "Departamento"],
        "Municipio": ["Municipality", "Município"],
        "Ej: Soacha": ["E.g.: Soacha", "Ex.: Soacha"],
        "Código oficial (DANE, SNIES o NIT)": ["Official code (DANE, SNIES or NIT)", "Código oficial (DANE, SNIES ou NIT)"],
        "Opcional si das un contacto": ["Optional if you give a contact", "Opcional se você informar um contato"],
        "Colegios: código DANE (12 dígitos). Universidades: código SNIES. Otros: NIT.": [
            "Schools: DANE code (12 digits). Universities: SNIES code. Others: NIT.",
            "Colégios: código DANE (12 dígitos). Universidades: código SNIES. Outros: NIT."
        ],
        "Correo institucional o sitio web": ["Institutional email or website", "E-mail institucional ou site"],

        // Datos personales
        "Nombres": ["First names", "Nomes"],
        "Tus nombres": ["Your first names", "Seus nomes"],
        "Apellidos": ["Last names", "Sobrenomes"],
        "Tus apellidos": ["Your last names", "Seus sobrenomes"],
        "Nombre de usuario": ["Username", "Nome de usuário"],
        "tu.usuario": ["your.username", "seu.usuario"],
        "Fecha de Nacimiento": ["Date of Birth", "Data de Nascimento"],
        "DD / MM / AAAA": ["DD / MM / YYYY", "DD / MM / AAAA"],
        "Abrir calendario": ["Open calendar", "Abrir calendário"],
        "Calendario de fecha de nacimiento": ["Date of birth calendar", "Calendário de data de nascimento"],
        "Mes anterior": ["Previous month", "Mês anterior"],
        "Mes siguiente": ["Next month", "Próximo mês"],
        "Do": ["Su", "Do"],
        "Lu": ["Mo", "Se"],
        "Ma": ["Tu", "Te"],
        "Mi": ["We", "Qu"],
        "Ju": ["Th", "Qu"],
        "Vi": ["Fr", "Sx"],
        "Sá": ["Sa", "Sá"],
        "Sexo": ["Sex", "Sexo"],
        "Masculino": ["Male", "Masculino"],
        "Femenino": ["Female", "Feminino"],
        "Intersexual": ["Intersex", "Intersexo"],
        "Prefiero no decirlo": ["Prefer not to say", "Prefiro não dizer"],
        "Género": ["Gender", "Gênero"],
        "Hombre": ["Man", "Homem"],
        "Mujer": ["Woman", "Mulher"],
        "¿Cuál?": ["Which one?", "Qual?"],
        "Tipo de Documento": ["Document Type", "Tipo de Documento"],
        "Cédula de Ciudadanía (CC)": ["Citizenship ID (CC)", "Cédula de Cidadania (CC)"],
        "Tarjeta de Identidad (TI)": ["Identity Card (TI)", "Cartão de Identidade (TI)"],
        "Cédula de Extranjería (CE)": ["Foreigner ID (CE)", "Cédula de Estrangeiro (CE)"],
        "Pasaporte (PA)": ["Passport (PA)", "Passaporte (PA)"],
        "Permiso de Protección Temporal (PPT)": ["Temporary Protection Permit (PPT)", "Permissão de Proteção Temporária (PPT)"],
        "¿Cuál tipo de documento?": ["Which document type?", "Qual tipo de documento?"],
        "Número de Documento": ["Document Number", "Número do Documento"],
        "Número de documento": ["Document number", "Número do documento"],
        "Entre 5 y 20 caracteres.": ["Between 5 and 20 characters.", "Entre 5 e 20 caracteres."],
        "Teléfono": ["Phone", "Telefone"],
        "Contraseña segura": ["Secure password", "Senha segura"],
        "Confirmar contraseña": ["Confirm password", "Confirmar senha"],
        "Repite tu contraseña": ["Repeat your password", "Repita sua senha"],

        // Medidor de contraseña
        "Sin contraseña": ["No password", "Sem senha"],
        "El candado está abierto.": ["The lock is open.", "O cadeado está aberto."],
        "Débil": ["Weak", "Fraca"],
        "Se puede adivinar con facilidad.": ["It can be guessed easily.", "Pode ser adivinhada com facilidade."],
        "Media": ["Medium", "Média"],
        "Añade longitud o símbolos para mejorarla.": ["Add length or symbols to improve it.", "Adicione comprimento ou símbolos para melhorá-la."],
        "Fuerte": ["Strong", "Forte"],
        "Buena contraseña. Un poco más y es máxima.": ["Good password. A little more and it's maxed out.", "Boa senha. Mais um pouco e é máxima."],
        "Muy segura": ["Very secure", "Muito segura"],
        "Candado sellado. Nivel máximo.": ["Lock sealed. Maximum level.", "Cadeado selado. Nível máximo."],
        "8+ caracteres": ["8+ characters", "8+ caracteres"],
        "Mayúscula": ["Uppercase", "Maiúscula"],
        "Minúscula": ["Lowercase", "Minúscula"],
        "Número": ["Number", "Número"],
        "Símbolo": ["Symbol", "Símbolo"],
        "Tu contraseña es muy débil. Hazla más larga o añade símbolos.": [
            "Your password is too weak. Make it longer or add symbols.",
            "Sua senha é muito fraca. Deixe-a mais longa ou adicione símbolos."
        ],

        // Términos (casilla del registro y ventana)
        "He leído y acepto los": ["I have read and accept the", "Li e aceito os"],
        "y la": ["and the", "e a"],
        "de TrueLock.": ["of TrueLock.", "da TrueLock."],
        "Términos y Condiciones / Terms & Conditions": ["Terms & Conditions", "Termos e Condições"],
        "✓ Aceptar / Accept": ["✓ Accept", "✓ Aceitar"],
        "✕ Rechazar / Reject": ["✕ Reject", "✕ Recusar"],
        "Términos y Condiciones aceptados.": ["Terms and Conditions accepted.", "Termos e Condições aceitos."],
        "Debes aceptar los Términos y Condiciones para crear tu cuenta.": [
            "You must accept the Terms and Conditions to create your account.",
            "Você deve aceitar os Termos e Condições para criar sua conta."
        ],
        "1. Uso del Software": ["1. Use of the Software", "1. Uso do Software"],
        "TrueLock es una solución de control y monitoreo de actividad digital. Al usar este software, aceptas utilizarlo únicamente para fines legales y con el consentimiento de las personas monitoreadas cuando así lo exija la ley aplicable.": [
            "TrueLock is a digital activity control and monitoring solution. By using this software, you agree to use it only for lawful purposes and with the consent of the monitored people when required by applicable law.",
            "A TrueLock é uma solução de controle e monitoramento de atividade digital. Ao usar este software, você concorda em utilizá-lo apenas para fins legais e com o consentimento das pessoas monitoradas quando exigido pela lei aplicável."
        ],
        "2. Privacidad y Datos": ["2. Privacy and Data", "2. Privacidade e Dados"],
        "Recopilamos datos de actividad del dispositivo para las funcionalidades del sistema. No vendemos ni compartimos tus datos con terceros sin tu consentimiento. Los datos se almacenan de forma segura y encriptada. Tienes derecho a solicitar la eliminación de tus datos en cualquier momento.": [
            "We collect device activity data for the system's features. We do not sell or share your data with third parties without your consent. Data is stored securely and encrypted. You have the right to request the deletion of your data at any time.",
            "Coletamos dados de atividade do dispositivo para as funcionalidades do sistema. Não vendemos nem compartilhamos seus dados com terceiros sem o seu consentimento. Os dados são armazenados de forma segura e criptografada. Você tem o direito de solicitar a exclusão dos seus dados a qualquer momento."
        ],
        "3. Política de Uso Aceptable": ["3. Acceptable Use Policy", "3. Política de Uso Aceitável"],
        "Queda prohibido el uso de TrueLock para actividades ilegales, espionaje no autorizado, o cualquier actividad que viole los derechos de privacidad de terceros. El administrador es responsable del uso adecuado del software en su organización.": [
            "Using TrueLock for illegal activities, unauthorized spying, or any activity that violates the privacy rights of third parties is prohibited. The administrator is responsible for the proper use of the software in their organization.",
            "É proibido o uso da TrueLock para atividades ilegais, espionagem não autorizada ou qualquer atividade que viole os direitos de privacidade de terceiros. O administrador é responsável pelo uso adequado do software em sua organização."
        ],
        "4. Limitación de Responsabilidad": ["4. Limitation of Liability", "4. Limitação de Responsabilidade"],
        "TrueLock se provee \"tal cual\". No garantizamos disponibilidad ininterrumpida del servicio. No somos responsables por pérdidas de datos ni daños derivados del uso del software más allá de lo permitido por la ley.": [
            "TrueLock is provided \"as is\". We do not guarantee uninterrupted availability of the service. We are not responsible for data loss or damages arising from the use of the software beyond what is permitted by law.",
            "A TrueLock é fornecida \"no estado em que se encontra\". Não garantimos a disponibilidade ininterrupta do serviço. Não somos responsáveis por perdas de dados nem por danos decorrentes do uso do software além do permitido por lei."
        ],
        "5. Modificaciones": ["5. Changes", "5. Modificações"],
        "Nos reservamos el derecho de modificar estos términos con previo aviso. El uso continuado del servicio implica la aceptación de los términos actualizados.": [
            "We reserve the right to modify these terms with prior notice. Continued use of the service implies acceptance of the updated terms.",
            "Reservamo-nos o direito de modificar estes termos mediante aviso prévio. O uso continuado do serviço implica a aceitação dos termos atualizados."
        ],
        "Privacy Policy / Política de Privacidad": ["Privacy Policy", "Política de Privacidade"],
        "Tratamos tus datos personales (nombre, fecha de nacimiento, documento, teléfono y correo) únicamente para crear y proteger tu cuenta y para el funcionamiento del servicio. Los menores de edad solo pueden usar TrueLock bajo la supervisión de un adulto responsable. Puedes consultar, corregir o eliminar tus datos escribiendo a soporte@truelock.com.": [
            "We process your personal data (name, date of birth, document, phone and email) only to create and protect your account and for the operation of the service. Minors may only use TrueLock under the supervision of a responsible adult. You can view, correct or delete your data by writing to soporte@truelock.com.",
            "Tratamos seus dados pessoais (nome, data de nascimento, documento, telefone e e-mail) apenas para criar e proteger sua conta e para o funcionamento do serviço. Menores de idade só podem usar a TrueLock sob a supervisão de um adulto responsável. Você pode consultar, corrigir ou excluir seus dados escrevendo para soporte@truelock.com."
        ],

        // Validaciones del registro
        "¿Ya tienes cuenta?": ["Already have an account?", "Já tem uma conta?"],
        "Inicia sesión": ["Sign in", "Entrar"],
        "Completa todos los campos para crear tu cuenta.": [
            "Fill in all the fields to create your account.",
            "Preencha todos os campos para criar sua conta."
        ],
        "Selecciona tu fecha de nacimiento.": ["Select your date of birth.", "Selecione sua data de nascimento."],
        "Fecha inválida. Usa el formato DD / MM / AAAA.": [
            "Invalid date. Use the format DD / MM / YYYY.",
            "Data inválida. Use o formato DD / MM / AAAA."
        ],
        "Fecha inválida. Revisa el día, el mes y el año.": [
            "Invalid date. Check the day, month and year.",
            "Data inválida. Confira o dia, o mês e o ano."
        ],
        "Fecha inválida: no puede ser posterior a hoy.": [
            "Invalid date: it cannot be later than today.",
            "Data inválida: não pode ser posterior a hoje."
        ],
        "El número de documento debe tener entre 5 y 20 caracteres.": [
            "The document number must be between 5 and 20 characters.",
            "O número do documento deve ter entre 5 e 20 caracteres."
        ],
        "El documento solo puede contener letras y números.": [
            "The document can only contain letters and numbers.",
            "O documento só pode conter letras e números."
        ],
        "Número de documento inválido.": ["Invalid document number.", "Número de documento inválido."],
        "El documento solo puede contener números.": [
            "The document can only contain numbers.",
            "O documento só pode conter números."
        ],
        "El número de documento no puede empezar por 0.": [
            "The document number cannot start with 0.",
            "O número do documento não pode começar com 0."
        ],
        "Ese número de documento no parece real. Revísalo.": [
            "That document number doesn't look real. Please check it.",
            "Esse número de documento não parece real. Confira-o."
        ],
        "La cédula de ciudadanía es para mayores de 18 años. Usa Tarjeta de Identidad.": [
            "The citizenship ID is for people over 18. Use Identity Card.",
            "A cédula de cidadania é para maiores de 18 anos. Use Cartão de Identidade."
        ],
        "La tarjeta de identidad es solo para menores de 18 años.": [
            "The identity card is only for people under 18.",
            "O cartão de identidade é apenas para menores de 18 anos."
        ],
        "Las contraseñas no coinciden.": ["The passwords do not match.", "As senhas não coincidem."],
        "Ya existe una cuenta con ese correo.": [
            "An account with that email already exists.",
            "Já existe uma conta com esse e-mail."
        ],
        "Ese nombre de usuario ya está en uso.": ["That username is already in use.", "Esse nome de usuário já está em uso."],
        "Ese número de teléfono ya está registrado.": [
            "That phone number is already registered.",
            "Esse número de telefone já está cadastrado."
        ],
        "No se pudo abrir la verificación. Revisa verificacion.js.": [
            "The verification could not be opened. Check verificacion.js.",
            "Não foi possível abrir a verificação. Confira o verificacion.js."
        ],

        // Verificación
        "Verifica tu cuenta": ["Verify your account", "Verifique sua conta"],
        "Elige dónde quieres recibir tu código de verificación.": [
            "Choose where you want to receive your verification code.",
            "Escolha onde deseja receber seu código de verificação."
        ],
        "Método de verificación": ["Verification method", "Método de verificação"],
        "Correo": ["Email", "E-mail"],
        "Teléfono (SMS)": ["Phone (SMS)", "Telefone (SMS)"],
        "Enviar código": ["Send code", "Enviar código"],
        "¿No recibiste el código?": ["Didn't receive the code?", "Não recebeu o código?"],
        "Reenviar": ["Resend", "Reenviar"],
        "Cambiar método": ["Change method", "Mudar método"],
        "Mensaje · Código": ["Message · Code", "Mensagem · Código"],
        "Rellenar": ["Fill in", "Preencher"],

        // Varios
        "Ayuda": ["Help", "Ajuda"],
        "¿Necesitas ayuda? Escríbenos a soporte@truelock.com": [
            "Need help? Write to us at soporte@truelock.com",
            "Precisa de ajuda? Escreva para soporte@truelock.com"
        ],
        "Cambiar a tema claro": ["Switch to light theme", "Mudar para o tema claro"],
        "Cambiar a tema oscuro": ["Switch to dark theme", "Mudar para o tema escuro"],
        "Cambiar idioma": ["Change language", "Mudar idioma"]

    });

    // Países (nombres sueltos, como aparecen en la lista del teléfono)
    Object.keys(PAISES).forEach(function (nombre) {
        DICCIONARIO.set(normalizar(nombre), PAISES[nombre]);
    });


    // =============================
    // IDIOMA ACTUAL
    // =============================

    function leerIdioma() {

        try {

            const guardado = localStorage.getItem(CLAVE_IDIOMA);

            if (IDIOMAS.indexOf(guardado) !== -1) {
                return guardado;
            }

        } catch (e) { }

        return "es";

    }

    idioma = leerIdioma();


    // =============================
    // MOTOR DE TRADUCCIÓN
    // Cada texto/atributo recuerda su versión original en español,
    // así se puede cambiar de idioma las veces que se quiera.
    // =============================

    const ATRIBUTOS = ["placeholder", "aria-label", "title", "alt"];
    const OMITIR = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, NOSCRIPT: 1 };

    const registroTextos = new WeakMap();
    const registroAtributos = new WeakMap();

    function buscar(texto, i) {

        const entrada = DICCIONARIO.get(texto);

        if (entrada) {
            return entrada[POSICION[i]] || null;
        }

        for (let n = 0; n < PATRONES.length; n++) {

            const resultado = PATRONES[n](texto, i);

            if (resultado) {
                return resultado;
            }

        }

        return null;

    }

    // Devuelve la traducción conservando los espacios de los extremos.
    // Si no hay traducción (o el idioma es español) devuelve el original.

    function traducirCadena(original, i) {

        if (i === "es") {
            return original;
        }

        const partes = /^(\s*)([\s\S]*?)(\s*)$/.exec(original);
        const nucleo = normalizar(partes[2]);

        if (!nucleo) {
            return original;
        }

        const traduccion = buscar(nucleo, i);

        return traduccion === null ? original : partes[1] + traduccion + partes[3];

    }

    function excluido(elemento) {

        return !!(elemento && elemento.closest && elemento.closest("[data-no-i18n]"));

    }

    function traducirTexto(nodo) {

        const padre = nodo.parentNode;

        if (!padre || OMITIR[padre.nodeName] || excluido(padre)) {
            return;
        }

        const actual = nodo.nodeValue;
        const registro = registroTextos.get(nodo);

        // Si otro script cambió el texto, ese texto nuevo es el original.

        const original = registro && registro.mostrado === actual ? registro.original : actual;
        const nuevo = traducirCadena(original, idioma);

        registroTextos.set(nodo, { original: original, mostrado: nuevo });

        if (nuevo !== actual) {
            nodo.nodeValue = nuevo;
        }

    }

    function traducirAtributo(elemento, atributo) {

        const actual = elemento.getAttribute(atributo);

        if (actual === null || excluido(elemento)) {
            return;
        }

        let registros = registroAtributos.get(elemento);

        if (!registros) {
            registros = {};
            registroAtributos.set(elemento, registros);
        }

        const registro = registros[atributo];
        const original = registro && registro.mostrado === actual ? registro.original : actual;
        const nuevo = traducirCadena(original, idioma);

        registros[atributo] = { original: original, mostrado: nuevo };

        if (nuevo !== actual) {
            elemento.setAttribute(atributo, nuevo);
        }

    }

    function traducirElemento(elemento) {

        if (OMITIR[elemento.nodeName]) {
            return;
        }

        ATRIBUTOS.forEach(function (atributo) {
            traducirAtributo(elemento, atributo);
        });

    }

    function recorrer(raiz) {

        if (!raiz) {
            return;
        }

        if (raiz.nodeType === 3) {
            traducirTexto(raiz);
            return;
        }

        if (raiz.nodeType !== 1 || OMITIR[raiz.nodeName] || excluido(raiz)) {
            return;
        }

        traducirElemento(raiz);

        const caminante = document.createTreeWalker(
            raiz,
            NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT
        );

        let nodo = caminante.nextNode();

        while (nodo) {

            if (nodo.nodeType === 3) {
                traducirTexto(nodo);
            } else {
                traducirElemento(nodo);
            }

            nodo = caminante.nextNode();

        }

    }

    // Título de la pestaña y descripción

    const TITULO_ORIGINAL = document.title;
    const metaDescripcion = document.querySelector('meta[name="description"]');
    const DESCRIPCION_ORIGINAL = metaDescripcion ? metaDescripcion.getAttribute("content") : "";

    function traducirCabecera() {

        document.title = traducirCadena(TITULO_ORIGINAL, idioma);

        if (metaDescripcion) {
            metaDescripcion.setAttribute("content", traducirCadena(DESCRIPCION_ORIGINAL, idioma));
        }

    }

    // Observa lo que los demás scripts escriben después
    // (avisos, mensajes de error, calendario, lista de instituciones, etc.)

    const observador = new MutationObserver(function (cambios) {

        if (idioma === "es") {
            return;
        }

        cambios.forEach(function (cambio) {

            if (cambio.type === "childList") {

                cambio.addedNodes.forEach(function (nodo) {
                    recorrer(nodo);
                });

            } else if (cambio.type === "characterData") {

                traducirTexto(cambio.target);

            } else if (cambio.type === "attributes") {

                traducirAtributo(cambio.target, cambio.attributeName);

            }

        });

    });

    observador.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ATRIBUTOS
    });


    // =============================
    // SELECTOR DE IDIOMA (botón + lista)
    // =============================

    const contenedor = document.getElementById("idioma-selector");
    const boton = document.getElementById("idioma-btn");
    const lista = document.getElementById("idioma-lista");
    const etiquetaCodigo = document.getElementById("idioma-codigo");
    const etiquetaNombre = document.getElementById("idioma-nombre");

    const NOMBRES = { es: "Español", en: "English", pt: "Português" };

    function marcarSelector() {

        if (etiquetaCodigo) {
            etiquetaCodigo.textContent = idioma.toUpperCase();
        }

        if (etiquetaNombre) {
            etiquetaNombre.textContent = NOMBRES[idioma];
        }

        if (lista) {

            lista.querySelectorAll("[data-idioma]").forEach(function (opcion) {

                const activa = opcion.getAttribute("data-idioma") === idioma;

                opcion.classList.toggle("activo", activa);
                opcion.setAttribute("aria-selected", activa ? "true" : "false");

            });

        }

    }

    function abrirLista() {

        if (!lista || !contenedor || !boton) {
            return;
        }

        lista.hidden = false;

        contenedor.classList.add("abierto");

        boton.setAttribute("aria-expanded", "true");

    }

    function cerrarLista() {

        if (!lista || !contenedor || !boton) {
            return;
        }

        lista.hidden = true;

        contenedor.classList.remove("abierto");

        boton.setAttribute("aria-expanded", "false");

    }

    function aplicarIdioma() {

        document.documentElement.lang = idioma;

        traducirCabecera();

        recorrer(document.body);

        marcarSelector();

    }

    function cambiarIdioma(nuevo) {

        if (IDIOMAS.indexOf(nuevo) === -1 || nuevo === idioma) {
            return;
        }

        idioma = nuevo;

        // Misma clave que usa index.html: allá también quedará en este idioma

        try {
            localStorage.setItem(CLAVE_IDIOMA, idioma);
        } catch (e) { }

        aplicarIdioma();

    }

    if (boton && lista) {

        boton.addEventListener("click", function (evento) {

            evento.stopPropagation();

            if (lista.hidden) {
                abrirLista();
            } else {
                cerrarLista();
            }

        });

        lista.querySelectorAll("[data-idioma]").forEach(function (opcion) {

            function elegir() {

                cambiarIdioma(opcion.getAttribute("data-idioma"));

                cerrarLista();

                boton.focus();

            }

            opcion.addEventListener("click", elegir);

            opcion.addEventListener("keydown", function (evento) {

                if (evento.key === "Enter" || evento.key === " ") {

                    evento.preventDefault();

                    elegir();

                }

            });

        });

        document.addEventListener("click", function (evento) {

            if (contenedor && !contenedor.contains(evento.target)) {
                cerrarLista();
            }

        });

        document.addEventListener("keydown", function (evento) {

            if (evento.key === "Escape") {
                cerrarLista();
            }

        });

    }

    // Si el idioma se cambia en otra pestaña (por ejemplo, index.html abierto)

    window.addEventListener("storage", function (evento) {

        if (evento.key === CLAVE_IDIOMA) {

            const nuevo = leerIdioma();

            if (nuevo !== idioma) {

                idioma = nuevo;

                aplicarIdioma();

            }

        }

    });


    // =============================
    // TEMA: SINCRONÍA CON index.html
    // El script del <head> de login.html ya lee "tema" del index al cargar.
    // Aquí se hace el camino de vuelta: si cambias el tema en el login,
    // también se guarda para index.html.
    // =============================

    function temaActual() {

        return document.documentElement.getAttribute("data-tema") === "light" ? "light" : "dark";

    }

    function sincronizarTema() {

        const tema = temaActual();

        try {
            localStorage.setItem(CLAVE_TEMA_LOGIN, tema);
            localStorage.setItem(CLAVE_TEMA_INDEX, tema === "light" ? "claro" : "oscuro");
        } catch (e) { }

    }

    new MutationObserver(sincronizarTema).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-tema"]
    });

    const botonTema = document.getElementById("tema-toggle");

    if (botonTema) {

        botonTema.addEventListener("click", function () {

            // tema.js cambia el tema en este mismo clic; leemos el resultado justo después

            setTimeout(sincronizarTema, 80);

        });

    }


    // =============================
    // API PÚBLICA (por si otro script necesita traducir un texto)
    // =============================

    window.TL_I18N = {

        agregar: agregar,

        // Traduce un texto en español al idioma actual
        t: function (textoEspanol) {
            return traducirCadena(textoEspanol, idioma);
        },

        idioma: function () {
            return idioma;
        },

        cambiar: cambiarIdioma

    };


    // =============================
    // INICIO
    // =============================

    aplicarIdioma();

})();