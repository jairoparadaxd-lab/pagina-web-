// =============================
// INSTITUCIÓN EDUCATIVA (solo cuentas tipo Director)
// 1) Catálogo local de más de 500 instituciones (colegios, universidades, técnicas y SENA)
// 2) Búsqueda en vivo en datos abiertos de Colombia (datos.gov.co)
// 3) Ingreso manual con verificación (código oficial o contacto institucional)
// =============================

(function () {

    const grupo = document.getElementById("grupo-institucion");
    const input = document.getElementById("registro-institucion");
    const lista = document.getElementById("inst-lista");
    const combo = document.getElementById("inst-combo");
    const hint = document.getElementById("inst-hint");
    const checkManual = document.getElementById("inst-no-aparece");
    const panelManual = document.getElementById("inst-manual");
    const selectTipoCuenta = document.getElementById("registro-tipo");

    if (!grupo || !input || !lista || !selectTipoCuenta) {
        return;
    }

    // ---------- Fuentes de datos abiertos (datos.gov.co) ----------
    // Solo el DUE de Bogotá está verificado. Para cubrir todo el país, busca en
    // datos.gov.co el DUE nacional, el SNIES (universidades) y el listado del SENA,
    // y agrega aquí el id de cada dataset (formato "xxxx-xxxx").

    const FUENTES_DATOS = [
        { id: "jebf-6unk", tipo: "colegio", etiqueta: "DUE Bogotá" }
        // { id: "xxxx-xxxx", tipo: "universidad", etiqueta: "SNIES", nombre: "nombre_institucion", ciudad: "municipio" },
    ];

    const URL_BASE = "https://www.datos.gov.co/resource/";

    // ---------- Catálogo local ----------
    // Formato de cada línea: tipo|Nombre|Ciudad
    // tipo: u = universidad, c = colegio, t = técnico/tecnológico, s = SENA
    // Para agregar una institución, añade una línea nueva en el bloque de abajo.

    const TIPOS = {
        u: "universidad",
        c: "colegio",
        t: "tecnologico",
        s: "sena"
    };

    const CATALOGO_TEXTO = `
u|Universidad Nacional de Colombia|Bogotá
u|Universidad de los Andes|Bogotá
u|Pontificia Universidad Javeriana|Bogotá
u|Universidad del Rosario|Bogotá
u|Universidad Externado de Colombia|Bogotá
u|Universidad de La Salle|Bogotá
u|Universidad Distrital Francisco José de Caldas|Bogotá
u|Universidad Pedagógica Nacional|Bogotá
u|Universidad Santo Tomás|Bogotá
u|Universidad Sergio Arboleda|Bogotá
u|Universidad Católica de Colombia|Bogotá
u|Universidad Antonio Nariño|Bogotá
u|Universidad Militar Nueva Granada|Bogotá
u|Escuela Colombiana de Ingeniería Julio Garavito|Bogotá
u|Politécnico Grancolombiano|Bogotá
u|Corporación Universitaria Minuto de Dios (UNIMINUTO)|Bogotá
u|Universidad Nacional Abierta y a Distancia (UNAD)|Bogotá
u|Universidad Libre|Bogotá
u|Universidad EAN|Bogotá
u|Universidad Central|Bogotá
u|Universidad de Bogotá Jorge Tadeo Lozano|Bogotá
u|Universidad Manuela Beltrán|Bogotá
u|Universidad INCCA de Colombia|Bogotá
u|Universidad Piloto de Colombia|Bogotá
u|Universidad de San Buenaventura|Bogotá
u|Universidad El Bosque|Bogotá
u|Universidad Colegio Mayor de Cundinamarca|Bogotá
u|Universidad Cooperativa de Colombia|Bogotá
u|Universidad de Ciencias Aplicadas y Ambientales (UDCA)|Bogotá
u|Fundación Universitaria Konrad Lorenz|Bogotá
u|Fundación Universitaria del Área Andina|Bogotá
u|Corporación Universitaria Iberoamericana|Bogotá
u|Universidad ECCI|Bogotá
u|Universidad Autónoma de Colombia|Bogotá
u|Escuela Superior de Administración Pública (ESAP)|Bogotá
u|Escuela Militar de Cadetes General José María Córdova|Bogotá
u|Universidad CESA|Bogotá
u|Fundación Universitaria San Martín|Bogotá
u|Universidad Agraria de Colombia|Bogotá
u|Fundación Universitaria Los Libertadores|Bogotá
u|Fundación Universitaria Juan N. Corpas|Bogotá
u|Fundación Universitaria Empresarial de la Cámara de Comercio de Bogotá (UNIEMPRESARIAL)|Bogotá
u|Corporación Universitaria Republicana|Bogotá
u|Corporación Universitaria UNITEC|Bogotá
u|Fundación Universitaria Panamericana (UNIPANAMERICANA)|Bogotá
u|Fundación Universitaria CAFAM|Bogotá
u|Fundación Universitaria Compensar|Bogotá
u|Escuela Colombiana de Rehabilitación|Bogotá
u|Escuela de Administración de Negocios (EAN)|Bogotá
u|Universidad de La Sabana|Chía
u|Universidad de Cundinamarca|Fusagasugá
u|Universidad Nacional de Colombia sede Medellín|Medellín
u|Universidad de Antioquia|Medellín
u|Universidad EAFIT|Medellín
u|Universidad Pontificia Bolivariana|Medellín
u|Universidad de Medellín|Medellín
u|Universidad CES|Medellín
u|Universidad Católica Luis Amigó|Medellín
u|Universidad Santo Tomás sede Medellín|Medellín
u|Universidad Autónoma Latinoamericana (UNAULA)|Medellín
u|Universidad Católica del Norte|Medellín
u|Universidad de San Buenaventura sede Medellín|Medellín
u|Universidad Cooperativa de Colombia sede Medellín|Medellín
u|Institución Universitaria Salazar y Herrera|Medellín
u|Universidad de Envigado|Envigado
u|Universidad Remington|Medellín
u|Institución Universitaria Colegio Mayor de Antioquia|Medellín
u|Institución Universitaria Pascual Bravo|Medellín
u|Universidad del Valle|Cali
u|Universidad ICESI|Cali
u|Universidad Autónoma de Occidente|Cali
u|Universidad Santiago de Cali|Cali
u|Pontificia Universidad Javeriana Cali|Cali
u|Universidad Libre Seccional Cali|Cali
u|Universidad de San Buenaventura Cali|Cali
u|Universidad Cooperativa de Colombia sede Cali|Cali
u|Universidad Antonio José Camacho|Cali
u|Institución Universitaria Escuela Nacional del Deporte|Cali
u|Fundación Universitaria Católica Lumen Gentium (UNICATÓLICA)|Cali
u|Universidad del Norte|Barranquilla
u|Universidad del Atlántico|Barranquilla
u|Universidad Autónoma del Caribe|Barranquilla
u|Universidad Simón Bolívar|Barranquilla
u|Universidad Libre Seccional Barranquilla|Barranquilla
u|Universidad de la Costa (CUC)|Barranquilla
u|Universidad Reformada|Barranquilla
u|Universidad Metropolitana|Barranquilla
u|Universidad Sergio Arboleda sede Barranquilla|Barranquilla
u|Universidad Industrial de Santander|Bucaramanga
u|Universidad Autónoma de Bucaramanga (UNAB)|Bucaramanga
u|Universidad Santo Tomás sede Bucaramanga|Bucaramanga
u|Universidad Pontificia Bolivariana sede Bucaramanga|Bucaramanga
u|Universidad Cooperativa de Colombia sede Bucaramanga|Bucaramanga
u|Universidad de Santander (UDES)|Bucaramanga
u|Universidad Manuela Beltrán sede Bucaramanga|Bucaramanga
u|Universidad de Investigación y Desarrollo (UDI)|Bucaramanga
u|Instituto Universitario de la Paz (UNIPAZ)|Barrancabermeja
u|Universidad Francisco de Paula Santander|Cúcuta
u|Universidad Francisco de Paula Santander Ocaña|Ocaña
u|Universidad de Pamplona|Pamplona
u|Universidad Simón Bolívar sede Cúcuta|Cúcuta
u|Universidad Libre Seccional Cúcuta|Cúcuta
u|Universidad Antonio Nariño sede Cúcuta|Cúcuta
u|Universidad Cooperativa de Colombia sede Cúcuta|Cúcuta
u|Universidad de Cartagena|Cartagena
u|Universidad Tecnológica de Bolívar|Cartagena
u|Corporación Universitaria Rafael Núñez|Cartagena
u|Universidad del Sinú|Cartagena
u|Universidad de San Buenaventura sede Cartagena|Cartagena
u|Fundación Universitaria Colombo Internacional (UNICOLOMBO)|Cartagena
u|Universidad Libre Seccional Cartagena|Cartagena
u|Universidad Tecnológica de Pereira|Pereira
u|Universidad Libre Seccional Pereira|Pereira
u|Universidad Católica de Pereira|Pereira
u|Universidad del Quindío|Armenia
u|Universidad La Gran Colombia sede Armenia|Armenia
u|Universidad de Caldas|Manizales
u|Universidad Nacional de Colombia sede Manizales|Manizales
u|Universidad de Manizales|Manizales
u|Universidad Autónoma de Manizales|Manizales
u|Universidad Católica de Manizales|Manizales
u|Universidad del Tolima|Ibagué
u|Universidad de Ibagué|Ibagué
u|Universidad Cooperativa de Colombia sede Ibagué|Ibagué
u|Universidad Surcolombiana|Neiva
u|Universidad de la Amazonia|Florencia
u|Universidad de los Llanos|Villavicencio
u|Universidad Santo Tomás sede Villavicencio|Villavicencio
u|Universidad Cooperativa de Colombia sede Villavicencio|Villavicencio
u|Universidad de Córdoba|Montería
u|Universidad de Sucre|Sincelejo
u|Universidad del Magdalena|Santa Marta
u|Universidad Popular del Cesar|Valledupar
u|Universidad de La Guajira|Riohacha
u|Universidad de Nariño|Pasto
u|Universidad Mariana|Pasto
u|Universidad CESMAG|Pasto
u|Universidad del Cauca|Popayán
u|Universidad Tecnológica del Chocó|Quibdó
u|Universidad Pedagógica y Tecnológica de Colombia (UPTC)|Tunja
u|Universidad de Boyacá|Tunja
u|Universidad Santo Tomás sede Tunja|Tunja
u|Universidad del Pacífico|Buenaventura
u|Universidad Internacional del Trópico Americano (UNITRÓPICO)|Yopal
u|Universidad Nacional de Colombia sede Palmira|Palmira
u|Universidad Nacional de Colombia sede Amazonia|Leticia
u|Universidad Nacional de Colombia sede Caribe|San Andrés
u|Universidad Nacional de Colombia sede Orinoquia|Arauca
u|Universidad Nacional de Colombia sede Tumaco|Tumaco
u|Universidad de Cundinamarca sede Girardot|Girardot
u|Universidad Católica de Oriente|Rionegro
u|Universidad Católica de Colombia sede Bogotá|Bogotá
u|Universidad Santo Tomás sede Cúcuta|Cúcuta
u|Universidad Cooperativa de Colombia sede Pasto|Pasto
u|Universidad Cooperativa de Colombia sede Montería|Montería
u|Universidad Cooperativa de Colombia sede Santa Marta|Santa Marta
u|Universidad Cooperativa de Colombia sede Neiva|Neiva
u|Universidad Cooperativa de Colombia sede Popayán|Popayán
u|Universidad Cooperativa de Colombia sede Barrancabermeja|Barrancabermeja
u|Universidad Cooperativa de Colombia sede Arauca|Arauca
u|Universidad Cooperativa de Colombia sede Apartadó|Apartadó
u|Universidad de Antioquia seccional Urabá|Apartadó
u|Universidad de Antioquia seccional Oriente|Rionegro
u|Universidad de Antioquia seccional Bajo Cauca|Caucasia
u|Universidad de Antioquia seccional Suroeste|Andes
u|Universidad de Antioquia seccional Magdalena Medio|Puerto Berrío
u|Universidad del Valle sede Palmira|Palmira
u|Universidad del Valle sede Buga|Buga
u|Universidad del Valle sede Tuluá|Tuluá
u|Universidad del Valle sede Cartago|Cartago
u|Universidad del Valle sede Yumbo|Yumbo
u|Universidad del Valle sede Buenaventura|Buenaventura
u|Universidad del Valle sede Caicedonia|Caicedonia
u|Universidad del Valle sede Zarzal|Zarzal
u|Universidad Industrial de Santander sede Barrancabermeja|Barrancabermeja
u|Universidad Industrial de Santander sede Málaga|Málaga
u|Universidad Industrial de Santander sede Socorro|Socorro
u|Universidad Industrial de Santander sede Barbosa|Barbosa
u|Universidad Industrial de Santander sede San Gil|San Gil
u|Universidad de Pamplona sede Villa del Rosario|Villa del Rosario
t|Instituto Tecnológico Metropolitano (ITM)|Medellín
t|Politécnico Colombiano Jaime Isaza Cadavid|Medellín
t|Tecnológico de Antioquia|Medellín
t|Escuela Tecnológica Instituto Técnico Central|Bogotá
t|Instituto Técnico Nacional de Comercio|Cali
t|Instituto Tecnológico de Soledad Atlántico (ITSA)|Soledad
t|Instituto Técnico Industrial Pascual Bravo|Medellín
t|Colegio Mayor del Cauca|Popayán
t|Conservatorio del Tolima|Ibagué
t|Instituto Tecnológico del Putumayo|Mocoa
t|Instituto Superior de Educación Rural (ISER)|Pamplona
t|Escuela Nacional de Minas|Medellín
t|Instituto de Educación Técnica Profesional de Roldanillo (INTEP)|Roldanillo
t|Escuela Superior Tecnológica de Artes Débora Arango|Envigado
t|Tecnológico Comfenalco|Cartagena
t|Escuela Naval de Suboficiales ARC Barranquilla|Barranquilla
t|Escuela de Aviación Militar Marco Fidel Suárez|Cali
t|Escuela Militar de Suboficiales Sargento Inocencio Chincá|Tolemaida
t|Escuela de Policía Gonzalo Jiménez de Quesada|Bogotá
t|Escuela de Policía Alejandro Gutiérrez|Cali
t|Escuela de Cadetes de Policía General Francisco de Paula Santander|Bogotá
t|Escuela Naval de Cadetes Almirante Padilla|Cartagena
s|SENA - Sede Nacional|Bogotá
s|SENA - Regional Amazonas|Leticia
s|SENA - Regional Antioquia|Medellín
s|SENA - Regional Arauca|Arauca
s|SENA - Regional Atlántico|Barranquilla
s|SENA - Regional Bolívar|Cartagena
s|SENA - Regional Boyacá|Tunja
s|SENA - Regional Caldas|Manizales
s|SENA - Regional Caquetá|Florencia
s|SENA - Regional Casanare|Yopal
s|SENA - Regional Cauca|Popayán
s|SENA - Regional Cesar|Valledupar
s|SENA - Regional Chocó|Quibdó
s|SENA - Regional Córdoba|Montería
s|SENA - Regional Cundinamarca|Bogotá
s|SENA - Regional Distrito Capital|Bogotá
s|SENA - Regional Guainía|Inírida
s|SENA - Regional Guaviare|San José del Guaviare
s|SENA - Regional Huila|Neiva
s|SENA - Regional La Guajira|Riohacha
s|SENA - Regional Magdalena|Santa Marta
s|SENA - Regional Meta|Villavicencio
s|SENA - Regional Nariño|Pasto
s|SENA - Regional Norte de Santander|Cúcuta
s|SENA - Regional Putumayo|Mocoa
s|SENA - Regional Quindío|Armenia
s|SENA - Regional Risaralda|Pereira
s|SENA - Regional San Andrés|San Andrés
s|SENA - Regional Santander|Bucaramanga
s|SENA - Regional Sucre|Sincelejo
s|SENA - Regional Tolima|Ibagué
s|SENA - Regional Valle del Cauca|Cali
s|SENA - Regional Vaupés|Mitú
s|SENA - Regional Vichada|Puerto Carreño
s|SENA - Centro de Gestión Administrativa|Bogotá
s|SENA - Centro Metalmecánico|Bogotá
s|SENA - Centro de Diseño y Metrología|Bogotá
s|SENA - Centro de Electricidad, Electrónica y Telecomunicaciones|Bogotá
s|SENA - Centro de Manufactura en Textil y Cuero|Bogotá
s|SENA - Centro de Servicios Financieros|Bogotá
s|SENA - Centro de Tecnologías del Transporte|Bogotá
s|SENA - Centro de Materiales y Ensayos|Bogotá
s|SENA - Centro Nacional de Hotelería, Turismo y Alimentos|Bogotá
s|SENA - Centro de Gestión de Mercados, Logística y Tecnologías de la Información|Bogotá
s|SENA - Centro de Biotecnología Agropecuaria|Mosquera
s|SENA - Centro de Comercio y Servicios|Cali
s|SENA - Centro Agropecuario|Buga
s|SENA - Centro de Diseño Tecnológico Industrial|Cali
s|SENA - Centro de Electricidad y Automatización Industrial (CEAI)|Cali
s|SENA - Centro Nacional Colombo Alemán|Barranquilla
s|SENA - Centro Industrial y de Aviación|Barranquilla
s|SENA - Centro de Comercio|Medellín
s|SENA - Centro de la Innovación, la Agroindustria y el Turismo|Medellín
s|SENA - Centro de Servicios y Gestión Empresarial|Medellín
s|SENA - Centro de Servicios de Salud|Medellín
s|SENA - Centro Minero|Sogamoso
s|SENA - Centro Industrial de Mantenimiento Integral (CIMI)|Bucaramanga
s|SENA - Centro de la Industria, la Empresa y los Servicios (CIES)|Cúcuta
c|Gimnasio Moderno|Bogotá
c|Gimnasio Campestre|Bogotá
c|Colegio Anglo Colombiano|Bogotá
c|Colegio Champagnat|Bogotá
c|Colegio San Bartolomé La Merced|Bogotá
c|Colegio Nuestra Señora del Pilar|Bogotá
c|Colegio Los Nogales|Bogotá
c|Colegio Nueva Granada|Bogotá
c|Gimnasio La Montaña|Bogotá
c|Gimnasio Femenino|Bogotá
c|Gimnasio Los Cerros|Bogotá
c|Gimnasio Los Pinos|Bogotá
c|Colegio Santa Francisca Romana|Bogotá
c|Colegio San Jorge de Inglaterra|Bogotá
c|Colegio Andino|Bogotá
c|Colegio Abraham Lincoln|Bogotá
c|Colegio Helvetia|Bogotá
c|Colegio Colombo Gales|Bogotá
c|Colegio Santa María|Bogotá
c|Colegio San Viator|Bogotá
c|Colegio De La Salle|Bogotá
c|Colegio Calasanz|Bogotá
c|Colegio Santa Clara|Bogotá
c|Liceo Francés Louis Pasteur|Bogotá
c|Liceo Cervantes|Bogotá
c|Colegio Reuven Feuerstein|Bogotá
c|Colegio Rochester|Bogotá
c|Colegio Cristóbal Colón|Bogotá
c|Instituto Pedagógico Nacional|Bogotá
c|Colegio Nacional Nicolás Esguerra|Bogotá
c|Colegio Mayor de San Bartolomé|Bogotá
c|Colegio Teresiano|Bogotá
c|Colegio San Mateo Apóstol|Bogotá
c|Colegio Bilingüe Buckingham|Bogotá
c|Colegio Emmanuel d'Alzon|Bogotá
c|Colegio La Presentación|Bogotá
c|Colegio Los Alcázares|Bogotá
c|Colegio Santa Dorotea|Bogotá
c|Gimnasio Vermont|Bogotá
c|Colegio Hispanoamericano|Bogotá
c|Colegio Pío XII|Bogotá
c|Gimnasio Sabio Caldas|Bogotá
c|Colegio INEM Santiago Pérez|Bogotá
c|Colegio INEM Francisco de Paula Santander|Bogotá
c|Colegio San Ignacio de Loyola|Bogotá
c|Colegio Marymount|Medellín
c|Colegio Montessori|Medellín
c|Colegio San Ignacio de Loyola|Medellín
c|Colegio Jesús María|Medellín
c|Colegio La Enseñanza|Medellín
c|Colegio Palermo de San José|Medellín
c|Colegio Calasanz|Medellín
c|Colegio Alemán|Medellín
c|Colegio Theodoro Hertzl|Medellín
c|Gimnasio Los Alcázares|Medellín
c|Gimnasio Los Pinares|Medellín
c|Colegio Benedictino|Medellín
c|Institución Educativa INEM José Félix de Restrepo|Medellín
c|Liceo Antioqueño|Medellín
c|Colegio Corazonista|Medellín
c|Colegio La Presentación|Medellín
c|Colegio Pedro Justo Berrío|Medellín
c|Colegio María Auxiliadora|Medellín
c|Colegio Santa Teresita|Medellín
c|Gimnasio Vermont|Medellín
c|Colegio Fe y Alegría|Medellín
c|Liceo Salazar y Herrera|Medellín
c|Colegio Padre Manyanet|Medellín
c|Gimnasio Los Cedros|Medellín
c|Colegio San Carlos|Medellín
c|Colegio Colombo Francés|Medellín
c|Colegio Cumbres|Medellín
c|Colegio Berchmans|Cali
c|Colegio Colombo Británico|Cali
c|Liceo Benalcázar|Cali
c|Colegio Bolívar|Cali
c|Colegio Santa Librada|Cali
c|Colegio Jefferson|Cali
c|Colegio La Merced|Cali
c|Colegio San Luis Gonzaga|Cali
c|Colegio Liceo Francés|Cali
c|Colegio Alemán|Cali
c|Colegio Santa Ana|Cali
c|Colegio La Presentación|Cali
c|Colegio Lacordaire|Cali
c|Colegio Teresiano|Cali
c|Colegio Americano|Cali
c|Colegio INEM Jorge Isaacs|Cali
c|Colegio Santa Dorotea|Cali
c|Colegio Mayor de Santa Isabel|Cali
c|Colegio San José de Calasanz|Cali
c|Colegio Isaias Gamboa|Cali
c|Colegio Santa Mariana de Jesús|Cali
c|Colegio Biffi La Salle|Barranquilla
c|Colegio Karl C. Parrish|Barranquilla
c|Colegio Alemán|Barranquilla
c|Colegio Marymount|Barranquilla
c|Colegio San José|Barranquilla
c|Colegio Americano|Barranquilla
c|Liceo de Cervantes|Barranquilla
c|Colegio Cristo Rey|Barranquilla
c|Colegio La Enseñanza|Barranquilla
c|Colegio Jesús María|Barranquilla
c|Colegio Mixto Juan Domínguez Romero|Barranquilla
c|Colegio Sagrado Corazón de Jesús|Barranquilla
c|Colegio Jorge Washington|Cartagena
c|Colegio Montessori|Cartagena
c|Colegio Mayor de Bolívar|Cartagena
c|Colegio La Presentación|Cartagena
c|Colegio Cartagena de Indias|Cartagena
c|Colegio Pedro de Heredia|Cartagena
c|Colegio San Pedro Claver|Cartagena
c|Colegio Fernández Baena|Cartagena
c|Colegio Sagrado Corazón de Jesús|Cartagena
c|Colegio Liceo de Bolívar|Cartagena
c|Colegio Calasanz|Cartagena
c|Colegio San José de Calasanz|Cúcuta
c|Colegio Sagrado Corazón de Jesús|Cúcuta
c|Colegio La Presentación|Cúcuta
c|Colegio Normal Superior|Cúcuta
c|Colegio Nacional de San José de Cúcuta|Cúcuta
c|Colegio Colombo Americano|Cúcuta
c|Colegio Mayor de Pamplona|Pamplona
c|Colegio Provincial San José|Pamplona
c|Colegio Normal Superior|Pamplona
c|Colegio Nuestra Señora del Rosario|Pamplona
c|Colegio Normal Superior|Ocaña
c|Colegio INEM Custodio García Rovira|Bucaramanga
c|Colegio San Pedro Claver|Bucaramanga
c|Colegio La Presentación|Bucaramanga
c|Colegio Santander|Bucaramanga
c|Colegio Americano|Bucaramanga
c|Colegio Jorge Ardila Duarte|Floridablanca
c|Colegio Normal Superior|Bucaramanga
c|Colegio Salesiano|Bucaramanga
c|Colegio Calasanz|Bucaramanga
c|Colegio INEM Felipe Pérez|Pereira
c|Colegio Liceo Pereira|Pereira
c|Colegio La Salle|Pereira
c|Colegio Nuestra Señora de Fátima|Pereira
c|Colegio Gimnasio del Pacífico|Pereira
c|Colegio San Carlos|Pereira
c|Colegio Pío XII|Pereira
c|Colegio Eugenio Pacelli|Manizales
c|Colegio Sagrado Corazón de Jesús|Manizales
c|Colegio San Luis Gonzaga|Manizales
c|Colegio La Presentación|Manizales
c|Colegio Isabel la Católica|Manizales
c|Colegio Liceo Isabel La Católica|Manizales
c|Colegio San Pedro Claver|Manizales
c|Colegio Calasanz|Manizales
c|Colegio La Presentación|Armenia
c|Colegio San Simón|Ibagué
c|Colegio Tolimense|Ibagué
c|Colegio La Presentación|Ibagué
c|Colegio Nacional Mariano Ospina Rodríguez|Ibagué
c|Colegio Manuel Murillo Toro|Ibagué
c|Colegio San Luis Gonzaga|Neiva
c|Colegio Santa Librada|Neiva
c|Colegio Nuestra Señora de la Presentación|Neiva
c|Colegio Normal Superior|Neiva
c|Colegio La Presentación|Villavicencio
c|Colegio La Presentación|Montería
c|Colegio La Presentación|Santa Marta
c|Colegio Liceo Celedón|Santa Marta
c|Colegio San Pedro Alejandrino|Santa Marta
c|Colegio Hermanas de la Presentación|Valledupar
c|Colegio Loperena|Valledupar
c|Colegio Nacional Pedro Castro Monsalvo|Valledupar
c|Colegio La Presentación|Sincelejo
c|Colegio Javeriano|Pasto
c|Colegio La Presentación|Pasto
c|Colegio Ciudad de Pasto|Pasto
c|Colegio San Felipe Neri|Pasto
c|Colegio Liceo de la Universidad de Nariño|Pasto
c|Colegio Liceo de la Universidad del Cauca|Popayán
c|Colegio Champagnat|Popayán
c|Colegio Normal Superior|Popayán
c|Colegio Boyacá|Tunja
c|Colegio Normal Superior|Tunja
c|Colegio Gustavo Rojas Pinilla|Tunja
c|Colegio La Presentación|Tunja
c|Colegio Bautista|San Andrés
c|Colegio Jorge Isaacs|Buenaventura
u|Fundación Universitaria Navarra (UNINAVARRA)|Neiva
u|Corporación Universitaria del Huila (CORHUILA)|Neiva
u|Corporación Universitaria Autónoma de Nariño (AUNAR)|Pasto
u|Universidad Autónoma del Cauca|Popayán
u|Fundación Universitaria de Popayán|Popayán
u|Corporación Universitaria Empresarial Alexander von Humboldt|Armenia
u|Corporación Universitaria Adventista (UNAC)|Medellín
u|Universidad Pontificia Bolivariana sede Montería|Montería
u|Universidad Pontificia Bolivariana sede Palmira|Palmira
u|Fundación Universitaria Católica del Norte|Santa Rosa de Osos
u|Universidad de Bogotá Jorge Tadeo Lozano sede Cartagena|Cartagena
u|Corporación Universitaria Americana|Barranquilla
u|Corporación Universitaria Latinoamericana (CUL)|Barranquilla
u|Fundación Universidad de América|Bogotá
u|Escuela de Ingeniería de Antioquia (EIA)|Envigado
u|Corporación Universitaria Lasallista|Caldas
u|Fundación Universitaria Bellas Artes|Medellín
u|Corporación Universitaria Unihorizonte|Bogotá
u|Universidad Libre sede Socorro|Socorro
u|UNAD - Centro Cúcuta|Cúcuta
u|UNAD - Centro Pamplona|Pamplona
u|UNAD - Centro Ocaña|Ocaña
u|UNAD - Centro Tibú|Tibú
u|UNAD - Centro Barranquilla|Barranquilla
u|UNAD - Centro Cartagena|Cartagena
u|UNAD - Centro Santa Marta|Santa Marta
u|UNAD - Centro Valledupar|Valledupar
u|UNAD - Centro Popayán|Popayán
u|UNAD - Centro Pasto|Pasto
u|UNAD - Centro Ibagué|Ibagué
u|UNAD - Centro Neiva|Neiva
u|UNAD - Centro Medellín|Medellín
u|UNAD - Centro Cali|Cali
u|UNAD - Centro Bucaramanga|Bucaramanga
u|UNAD - Centro Pereira|Pereira
u|UNAD - Centro Villavicencio|Villavicencio
u|UNAD - Centro Montería|Montería
u|UNAD - Centro Tunja|Tunja
u|UNAD - Centro Florencia|Florencia
u|UNAD - Centro Yopal|Yopal
u|UNAD - Centro Arauca|Arauca
u|UNIMINUTO - Sede Cúcuta|Cúcuta
u|UNIMINUTO - Sede Bello|Bello
u|UNIMINUTO - Sede Cali|Cali
u|UNIMINUTO - Sede Barranquilla|Barranquilla
u|UNIMINUTO - Sede Bucaramanga|Bucaramanga
u|UNIMINUTO - Sede Soacha|Soacha
u|UNIMINUTO - Sede Girardot|Girardot
u|UNIMINUTO - Sede Villavicencio|Villavicencio
u|UNIMINUTO - Sede Neiva|Neiva
u|UNIMINUTO - Sede Pereira|Pereira
u|Politécnico Grancolombiano sede Medellín|Medellín
u|Politécnico Grancolombiano sede Cali|Cali
u|Universidad Antonio Nariño sede Medellín|Medellín
u|Universidad Antonio Nariño sede Cali|Cali
u|Universidad Antonio Nariño sede Barranquilla|Barranquilla
u|Universidad Antonio Nariño sede Bucaramanga|Bucaramanga
u|Universidad Antonio Nariño sede Pasto|Pasto
u|Universidad Antonio Nariño sede Popayán|Popayán
u|Universidad Manuela Beltrán sede Cúcuta|Cúcuta
u|Universidad Santo Tomás sede Pereira|Pereira
u|Fundación Universitaria del Área Andina sede Pereira|Pereira
u|Fundación Universitaria del Área Andina sede Valledupar|Valledupar
c|Colegio Jordán de Sajonia|Bogotá
c|Colegio San Tarsicio|Bogotá
c|Liceo Patria|Bogotá
c|Colegio Santa Luisa|Bogotá
c|Colegio Gimnasio Británico|Bogotá
c|Colegio San Bernardino|Bogotá
c|Colegio Los Ángeles|Bogotá
c|Colegio Nuestra Señora de la Sabiduría|Bogotá
c|Colegio INEM Lorencita Villegas de Santos|Bogotá
c|Colegio Marco Fidel Suárez|Medellín
c|Colegio Gimnasio Los Portales|Bogotá
`;

    const CATALOGO = CATALOGO_TEXTO
        .split("\n")
        .map(function (linea) { return linea.trim(); })
        .filter(function (linea) { return linea.length > 0; })
        .map(function (linea) {

            const partes = linea.split("|");

            return {
                nombre: partes[1],
                ciudad: partes[2],
                tipo: TIPOS[partes[0]] || "otro",
                origen: "catalogo"
            };

        });

    const ETIQUETA_TIPO = {
        universidad: "Universidad",
        colegio: "Colegio",
        tecnologico: "Técnico/Tecnológico",
        sena: "SENA",
        otro: "Otro"
    };

    const DEPARTAMENTOS = [
        "Amazonas", "Antioquia", "Arauca", "Atlántico", "Bogotá D.C.", "Bolívar", "Boyacá",
        "Caldas", "Caquetá", "Casanare", "Cauca", "Cesar", "Chocó", "Córdoba", "Cundinamarca",
        "Guainía", "Guaviare", "Huila", "La Guajira", "Magdalena", "Meta", "Nariño",
        "Norte de Santander", "Putumayo", "Quindío", "Risaralda",
        "San Andrés y Providencia", "Santander", "Sucre", "Tolima", "Valle del Cauca",
        "Vaupés", "Vichada"
    ];

    // ---------- Estado ----------

    let seleccionada = null;
    let resultados = [];
    let indiceResaltado = -1;
    let contadorBusqueda = 0;
    let temporizador = null;

    // ---------- Utilidades ----------

    function normalizar(texto) {

        return String(texto || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/\s+/g, " ")
            .trim();

    }

    function limpiarEspacios(texto) {

        return String(texto || "").trim().replace(/\s+/g, " ");

    }

    function pintarHint(mensaje, error) {

        hint.textContent = mensaje;
        hint.classList.toggle("form-hint-error", !!error);
        hint.classList.toggle("form-hint-neutral", !error && !seleccionada);
        grupo.classList.toggle("campo-invalido", !!error);

    }

    // ---------- Búsqueda local ----------
    // Cada palabra escrita debe aparecer en el nombre o la ciudad (sin tildes ni mayúsculas).
    // Las coincidencias que EMPIEZAN con lo escrito salen primero.

    function buscarLocal(consulta) {

        const normalizada = normalizar(consulta);
        const tokens = normalizada.split(" ");

        const coincidencias = CATALOGO.filter(function (inst) {

            const base = normalizar(inst.nombre + " " + inst.ciudad);

            return tokens.every(function (t) { return base.indexOf(t) !== -1; });

        });

        coincidencias.sort(function (a, b) {

            const aEmpieza = normalizar(a.nombre).indexOf(normalizada) === 0 ? 0 : 1;
            const bEmpieza = normalizar(b.nombre).indexOf(normalizada) === 0 ? 0 : 1;

            return aEmpieza - bEmpieza;

        });

        return coincidencias;

    }

    // ---------- Búsqueda en datos abiertos ----------

    function extraerCampo(fila, preferido, patron) {

        if (preferido && fila[preferido]) {
            return String(fila[preferido]).trim();
        }

        if (!patron) {
            return "";
        }

        const clave = Object.keys(fila).find(function (k) { return patron.test(k); });

        return clave ? String(fila[clave]).trim() : "";

    }

    function buscarFuente(fuente, consulta) {

        const url = URL_BASE + fuente.id + ".json?$limit=12&$q=" + encodeURIComponent(consulta);

        const control = new AbortController();
        const corte = setTimeout(function () { control.abort(); }, 6000);

        return fetch(url, { signal: control.signal })
            .then(function (r) {
                if (!r.ok) { throw new Error("HTTP " + r.status); }
                return r.json();
            })
            .then(function (filas) {

                if (!Array.isArray(filas)) { return []; }

                return filas.map(function (fila) {

                    const nombre =
                        extraerCampo(fila, fuente.nombre, null) ||
                        extraerCampo(fila, "", /^nombre.*(establecimiento|instituci)/) ||
                        extraerCampo(fila, "", /nombre/);

                    const ciudad = extraerCampo(fila, fuente.ciudad, /(municipio|ciudad|localidad)/);

                    return {
                        nombre: nombre,
                        ciudad: ciudad || "Colombia",
                        tipo: fuente.tipo,
                        origen: "datos.gov.co",
                        fuente: fuente.etiqueta || fuente.id
                    };

                }).filter(function (i) { return i.nombre; });

            })
            .catch(function () { return []; })
            .then(function (r) {
                clearTimeout(corte);
                return r;
            });

    }

    function buscarRemoto(consulta) {

        if (!FUENTES_DATOS.length || !navigator.onLine) {
            return Promise.resolve([]);
        }

        return Promise.all(FUENTES_DATOS.map(function (f) {
            return buscarFuente(f, consulta);
        })).then(function (grupos) {
            return [].concat.apply([], grupos);
        });

    }

    function unirSinRepetir(a, b) {

        const vistos = {};
        const salida = [];

        a.concat(b).forEach(function (inst) {

            const clave = normalizar(inst.nombre) + "|" + normalizar(inst.ciudad);

            if (!vistos[clave]) {
                vistos[clave] = true;
                salida.push(inst);
            }

        });

        return salida;

    }

    // ---------- Lista desplegable ----------

    function abrirLista() {

        lista.hidden = false;
        input.setAttribute("aria-expanded", "true");

    }

    function cerrarLista() {

        lista.hidden = true;
        input.setAttribute("aria-expanded", "false");
        indiceResaltado = -1;

    }

    function resaltar(indice) {

        const items = lista.querySelectorAll(".inst-opcion");

        items.forEach(function (el, i) {
            el.classList.toggle("resaltado", i === indice);
        });

        indiceResaltado = indice;

        if (items[indice]) {
            items[indice].scrollIntoView({ block: "nearest" });
        }

    }

    function elegir(inst) {

        seleccionada = inst;

        input.value = inst.nombre;

        hint.textContent = "✓ " + inst.nombre + " (" + inst.ciudad + ")";
        hint.classList.remove("form-hint-error", "form-hint-neutral");
        grupo.classList.remove("campo-invalido");

        cerrarLista();

    }

    function pintarLista(items, cargando) {

        lista.textContent = "";

        resultados = items.slice(0, 15);
        indiceResaltado = -1;

        resultados.forEach(function (inst) {

            const li = document.createElement("li");
            li.className = "inst-opcion";
            li.setAttribute("role", "option");

            const nombre = document.createElement("span");
            nombre.className = "inst-opcion-nombre";
            nombre.textContent = inst.nombre;

            const meta = document.createElement("span");
            meta.className = "inst-opcion-meta";

            const badge = document.createElement("span");
            badge.className = "inst-badge";
            badge.textContent = ETIQUETA_TIPO[inst.tipo] || "Institución";

            const ciudad = document.createElement("span");
            ciudad.textContent = inst.ciudad;

            meta.appendChild(badge);
            meta.appendChild(ciudad);

            li.appendChild(nombre);
            li.appendChild(meta);

            li.addEventListener("mousedown", function (e) {
                e.preventDefault();
                elegir(inst);
            });

            lista.appendChild(li);

        });

        if (!resultados.length) {

            const vacio = document.createElement("li");
            vacio.className = "inst-vacio";
            vacio.textContent = cargando
                ? "Buscando en el directorio oficial..."
                : "Sin resultados. Marca \"Mi institución no aparece en la lista\" para escribirla.";

            lista.appendChild(vacio);

        }

        abrirLista();

    }

    function buscar(consulta) {

        const numero = ++contadorBusqueda;
        const locales = buscarLocal(consulta);

        pintarLista(locales, true);

        buscarRemoto(consulta).then(function (remotos) {

            // Ignorar respuestas viejas si el usuario siguió escribiendo o ya eligió
            if (numero !== contadorBusqueda || seleccionada) {
                return;
            }

            pintarLista(unirSinRepetir(locales, remotos), false);

        });

    }

    input.addEventListener("input", function () {

        seleccionada = null;

        const consulta = limpiarEspacios(input.value);

        clearTimeout(temporizador);

        contadorBusqueda++;

        if (consulta.length < 3) {

            cerrarLista();
            pintarHint("Escribe al menos 3 letras para buscar.", false);

            return;

        }

        pintarHint("Selecciona tu institución de la lista.", false);

        temporizador = setTimeout(function () { buscar(consulta); }, 300);

    });

    input.addEventListener("keydown", function (e) {

        const total = lista.querySelectorAll(".inst-opcion").length;

        if (e.key === "ArrowDown" && total) {
            e.preventDefault();
            resaltar((indiceResaltado + 1) % total);
        } else if (e.key === "ArrowUp" && total) {
            e.preventDefault();
            resaltar((indiceResaltado - 1 + total) % total);
        } else if (e.key === "Enter" && !lista.hidden && indiceResaltado >= 0) {
            e.preventDefault();
            elegir(resultados[indiceResaltado]);
        } else if (e.key === "Escape") {
            cerrarLista();
        }

    });

    document.addEventListener("click", function (e) {

        if (!combo.contains(e.target)) {
            cerrarLista();
        }

    });

    // ---------- Modo manual ----------

    const mNombre = document.getElementById("inst-m-nombre");
    const mTipo = document.getElementById("inst-m-tipo");
    const mDepto = document.getElementById("inst-m-departamento");
    const mMunicipio = document.getElementById("inst-m-municipio");
    const mCodigo = document.getElementById("inst-m-codigo");
    const mContacto = document.getElementById("inst-m-contacto");

    DEPARTAMENTOS.forEach(function (d) {

        const op = document.createElement("option");
        op.value = d;
        op.textContent = d;
        mDepto.appendChild(op);

    });

    mCodigo.addEventListener("input", function () {
        mCodigo.value = mCodigo.value.replace(/[^\d-]/g, "");
    });

    checkManual.addEventListener("change", function () {

        panelManual.hidden = !checkManual.checked;

        if (checkManual.checked) {

            seleccionada = null;
            cerrarLista();

            if (!mNombre.value && limpiarEspacios(input.value).length >= 3) {
                mNombre.value = limpiarEspacios(input.value);
            }

            mNombre.focus();

        }

    });

    const CORREOS_GRATIS = /@(gmail|hotmail|outlook|live|yahoo|icloud|proton|protonmail|msn)\./i;

    function contactoValido(texto) {

        const t = texto.trim();

        if (!t) { return false; }

        if (t.indexOf("@") !== -1) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t) && !CORREOS_GRATIS.test(t);
        }

        return /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/\S*)?$/i.test(t);

    }

    function codigoValido(texto) {

        const t = texto.trim();

        if (!t) { return false; }

        return /^\d{12}$/.test(t) ||        // DANE (establecimiento)
               /^\d{3,5}$/.test(t) ||       // SNIES (institución)
               /^\d{9}-?\d$/.test(t);       // NIT

    }

    function validarManual() {

        const nombre = limpiarEspacios(mNombre.value);

        if (nombre.length < 4 || !/[a-záéíóúñ]{3}/i.test(nombre) || /^(.)\1+$/.test(nombre)) {
            return { ok: false, mensaje: "Escribe el nombre completo de la institución.", foco: "inst-m-nombre" };
        }

        if (!mTipo.value) {
            return { ok: false, mensaje: "Selecciona el tipo de institución.", foco: "inst-m-tipo" };
        }

        if (!mDepto.value) {
            return { ok: false, mensaje: "Selecciona el departamento de la institución.", foco: "inst-m-departamento" };
        }

        if (limpiarEspacios(mMunicipio.value).length < 3) {
            return { ok: false, mensaje: "Escribe el municipio de la institución.", foco: "inst-m-municipio" };
        }

        const codigo = mCodigo.value.trim();
        const contacto = mContacto.value.trim();

        if (codigo && !codigoValido(codigo)) {
            return { ok: false, mensaje: "Código no válido. Usa DANE (12 dígitos), SNIES (3 a 5 dígitos) o NIT.", foco: "inst-m-codigo" };
        }

        if (contacto && !contactoValido(contacto)) {
            return { ok: false, mensaje: "Usa un correo institucional (no Gmail/Hotmail) o el sitio web de la institución.", foco: "inst-m-contacto" };
        }

        if (!codigo && !contacto) {
            return { ok: false, mensaje: "Para verificar tu institución ingresa un código oficial o un contacto institucional.", foco: "inst-m-codigo" };
        }

        return {
            ok: true,
            mensaje: "",
            datos: {
                nombre: nombre,
                tipo: mTipo.value,
                ciudad: limpiarEspacios(mMunicipio.value),
                departamento: mDepto.value,
                codigo: codigo,
                contacto: contacto,
                origen: "manual",
                estadoVerificacion: "pendiente"
            }
        };

    }

    // ---------- Mostrar solo para Director ----------

    function actualizarVisibilidad() {

        const esDirector = selectTipoCuenta.value === "director";

        grupo.hidden = !esDirector;

        if (!esDirector) {
            cerrarLista();
        }

    }

    selectTipoCuenta.addEventListener("change", actualizarVisibilidad);

    // ---------- Reinicio del formulario ----------

    function reiniciar() {

        seleccionada = null;
        resultados = [];

        input.value = "";
        checkManual.checked = false;
        panelManual.hidden = true;

        [mNombre, mMunicipio, mCodigo, mContacto].forEach(function (c) { c.value = ""; });
        mTipo.selectedIndex = 0;
        mDepto.selectedIndex = 0;

        cerrarLista();

        pintarHint("Escribe al menos 3 letras para buscar.", false);

        actualizarVisibilidad();

    }

    if (selectTipoCuenta.form) {
        selectTipoCuenta.form.addEventListener("reset", function () {
            setTimeout(reiniciar, 0);
        });
    }

    // ---------- API pública (la usa login.js al enviar el registro) ----------

    window.validarInstitucion = function (tipoCuenta) {

        // Solo los directores deben indicar institución
        if (tipoCuenta !== "director") {
            return { ok: true, mensaje: "", datos: null };
        }

        if (checkManual.checked) {

            const manual = validarManual();

            if (!manual.ok) {
                pintarHint(manual.mensaje, true);
            }

            return manual;

        }

        if (!seleccionada) {

            const mensaje = "Selecciona tu institución de la lista o marca que no aparece.";

            pintarHint(mensaje, true);

            return { ok: false, mensaje: mensaje, foco: "registro-institucion" };

        }

        return {
            ok: true,
            mensaje: "",
            datos: {
                nombre: seleccionada.nombre,
                tipo: seleccionada.tipo,
                ciudad: seleccionada.ciudad,
                origen: seleccionada.origen,
                estadoVerificacion: "verificada"
            }
        };

    };

    actualizarVisibilidad();

})();