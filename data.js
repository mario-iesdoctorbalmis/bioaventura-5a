const TOPICS = [
  { id: 'huesos', name: 'Los huesos', short: 'Huesos', icon: 'bone', color: 'coral', image: 'resources/photo_2026-11-19_16-12-47.jpg', description: 'Descubre las piezas que sostienen tu cuerpo.' },
  { id: 'musculos', name: 'Los músculos', short: 'Músculos', icon: 'zap', color: 'yellow', image: 'resources/photo_2026-11-19_16-12-52.jpg', description: 'Conoce los músculos que te ponen en movimiento.' },
  { id: 'oido', name: 'El oído', short: 'Oído', icon: 'ear', color: 'blue', image: 'resources/photo_2026-11-19_16-12-50.jpg', description: 'Sigue el viaje del sonido hasta el cerebro.' },
  { id: 'vista', name: 'La vista', short: 'Vista', icon: 'eye', color: 'green', image: 'resources/photo_2026-11-19_16-12-50.jpg', description: 'Explora las partes del ojo y cómo se protege.' },
  { id: 'gusto', name: 'El gusto', short: 'Gusto', icon: 'smile', color: 'pink', image: 'resources/photo_2026-11-19_16-12-50.jpg', description: 'Investiga los cinco sabores básicos.' }
];

const QUESTIONS = [
  { topic: 'huesos', q: '¿Qué hueso encontramos en el muslo?', options: ['Fémur', 'Húmero', 'Radio', 'Clavícula'], answer: 0, explanation: 'El fémur es el hueso largo del muslo, entre la pelvis y la rodilla.' },
  { topic: 'huesos', q: '¿Qué hueso está en la parte superior del brazo?', options: ['Tibia', 'Húmero', 'Peroné', 'Fémur'], answer: 1, explanation: 'El húmero se encuentra entre el hombro y el codo.' },
  { topic: 'huesos', q: '¿Qué huesos forman la caja que protege el corazón y los pulmones?', options: ['Las falanges', 'Las vértebras', 'Las costillas', 'Los metatarsos'], answer: 2, explanation: 'Las costillas forman la caja torácica y ayudan a proteger esos órganos.' },
  { topic: 'huesos', q: '¿Cómo se llama el hueso situado en la parte delantera de la rodilla?', options: ['Rótula', 'Pelvis', 'Esternón', 'Carpo'], answer: 0, explanation: 'La rótula está delante de la articulación de la rodilla.' },
  { topic: 'huesos', q: '¿Qué huesos forman la columna vertebral?', options: ['Costillas', 'Vértebras', 'Falanges', 'Clavículas'], answer: 1, explanation: 'La columna vertebral está formada por vértebras.' },
  { topic: 'huesos', q: '¿Qué dos huesos se encuentran en el antebrazo?', options: ['Tibia y peroné', 'Radio y cúbito', 'Fémur y rótula', 'Frontal y parietal'], answer: 1, explanation: 'El radio y el cúbito forman el antebrazo.' },
  { topic: 'huesos', q: '¿Qué huesos encontramos en los dedos de manos y pies?', options: ['Falanges', 'Vértebras', 'Costillas', 'Omoplatos'], answer: 0, explanation: 'Los dedos de las manos y los pies tienen falanges.' },
  { topic: 'huesos', q: '¿Qué dos huesos están en la pierna, debajo de la rodilla?', options: ['Radio y cúbito', 'Húmero y clavícula', 'Tibia y peroné', 'Frontal y temporal'], answer: 2, explanation: 'La tibia y el peroné se encuentran entre la rodilla y el tobillo.' },
  { topic: 'huesos', q: '¿Qué hueso está en el centro de la parte delantera del pecho?', options: ['Esternón', 'Omoplato', 'Maxilar', 'Carpo'], answer: 0, explanation: 'El esternón está en el centro del pecho y se une a varias costillas.' },
  { topic: 'huesos', q: '¿Qué hueso pertenece a la cabeza?', options: ['Parietal', 'Fémur', 'Tibia', 'Rótula'], answer: 0, explanation: 'El parietal es uno de los huesos del cráneo.' },
  { topic: 'huesos', q: '¿Cómo se llama el conjunto de huesos de la muñeca?', options: ['Tarso', 'Carpo', 'Metatarso', 'Pelvis'], answer: 1, explanation: 'El carpo es el conjunto de huesos de la muñeca.' },
  { topic: 'huesos', q: '¿Qué hueso está en la zona de la cadera?', options: ['Pelvis', 'Esternón', 'Húmero', 'Frontal'], answer: 0, explanation: 'La pelvis forma la estructura ósea de la cadera.' },
  { topic: 'huesos', q: '¿Qué hueso del cráneo está en la frente?', options: ['Frontal', 'Temporal', 'Fémur', 'Esternón'], answer: 0, explanation: 'El hueso frontal forma la frente.' },
  { topic: 'huesos', q: '¿Qué hueso del cráneo está en la zona de la sien?', options: ['Temporal', 'Tibia', 'Rótula', 'Clavícula'], answer: 0, explanation: 'El temporal se encuentra en los lados del cráneo, cerca de las sienes.' },
  { topic: 'huesos', q: '¿Qué hueso forma parte de la mandíbula superior?', options: ['Maxilar', 'Peroné', 'Radio', 'Omoplato'], answer: 0, explanation: 'El maxilar forma parte de la cara y de la mandíbula superior.' },
  { topic: 'huesos', q: '¿Qué hueso alargado está entre el pecho y el hombro?', options: ['Clavícula', 'Tibia', 'Fémur', 'Parietal'], answer: 0, explanation: 'La clavícula une la zona del esternón con el hombro.' },
  { topic: 'huesos', q: '¿Qué hueso plano está en la espalda, cerca del hombro?', options: ['Omoplato', 'Rótula', 'Maxilar', 'Carpo'], answer: 0, explanation: 'El omoplato, también llamado escápula, está en la parte superior de la espalda.' },
  { topic: 'huesos', q: '¿Cómo se llaman los huesos de la palma de la mano?', options: ['Metacarpo', 'Metatarso', 'Tarso', 'Vértebras'], answer: 0, explanation: 'Los huesos del metacarpo forman la palma, entre la muñeca y los dedos.' },
  { topic: 'huesos', q: '¿Cómo se llama el conjunto de huesos de la zona del tobillo?', options: ['Tarso', 'Carpo', 'Metacarpo', 'Esternón'], answer: 0, explanation: 'El tarso reúne los huesos de la parte posterior del pie, en la zona del tobillo.' },
  { topic: 'huesos', q: '¿Cómo se llaman los huesos del pie entre el tarso y los dedos?', options: ['Metatarso', 'Metacarpo', 'Vértebras', 'Cúbito'], answer: 0, explanation: 'El metatarso está formado por los huesos situados entre el tarso y las falanges de los dedos del pie.' },
  { topic: 'musculos', q: '¿Qué músculo se encuentra en la parte delantera del brazo?', options: ['Bíceps', 'Gemelo', 'Glúteo', 'Tibial'], answer: 0, explanation: 'El bíceps está en la parte delantera del brazo y ayuda a doblar el codo.' },
  { topic: 'musculos', q: '¿Qué músculo está en la parte posterior del brazo?', options: ['Pectoral', 'Tríceps', 'Cuádriceps', 'Masetero'], answer: 1, explanation: 'El tríceps está en la parte posterior del brazo y ayuda a estirar el codo.' },
  { topic: 'musculos', q: '¿Qué músculo está en la parte delantera del muslo?', options: ['Trapecio', 'Deltoides', 'Cuádriceps', 'Gemelo'], answer: 2, explanation: 'El cuádriceps ocupa la parte delantera del muslo.' },
  { topic: 'musculos', q: '¿Qué músculos protegen la zona del vientre y ayudan a flexionar el tronco hacia delante?', options: ['Dorsales', 'Abdominales', 'Pectorales', 'Glúteos'], answer: 1, explanation: 'Los abdominales están en la parte delantera del abdomen y ayudan a flexionar el tronco.' },
  { topic: 'musculos', q: '¿Qué músculo está en la pantorrilla?', options: ['Gemelo', 'Pectoral', 'Masetero', 'Deltoides'], answer: 0, explanation: 'Los gemelos están en la parte posterior de la pierna, en la pantorrilla.' },
  { topic: 'musculos', q: '¿Qué músculo ayuda a masticar?', options: ['Masetero', 'Glúteo', 'Tibial', 'Dorsal'], answer: 0, explanation: 'El masetero mueve la mandíbula y ayuda a masticar.' },
  { topic: 'musculos', q: '¿Qué músculo cubre la zona del hombro?', options: ['Deltoides', 'Abdominal', 'Gemelo', 'Bíceps femoral'], answer: 0, explanation: 'El deltoides está en el hombro y ayuda a mover el brazo.' },
  { topic: 'musculos', q: '¿Dónde se encuentra el pectoral?', options: ['En el pecho', 'En la pantorrilla', 'En la espalda baja', 'En la mano'], answer: 0, explanation: 'El pectoral es un músculo de la zona del pecho.' },
  { topic: 'musculos', q: '¿Qué músculo se encuentra en la parte posterior del muslo?', options: ['Bíceps femoral', 'Orbicular de los labios', 'Pectoral', 'Deltoides'], answer: 0, explanation: 'El bíceps femoral se encuentra en la parte posterior del muslo.' },
  { topic: 'musculos', q: '¿Qué músculo rodea los ojos y ayuda a cerrar los párpados?', options: ['Orbicular de los párpados', 'Tibial', 'Glúteo', 'Bíceps femoral'], answer: 0, explanation: 'El orbicular de los párpados rodea el ojo y ayuda a cerrar los párpados.' },
  { topic: 'musculos', q: '¿Qué músculo rodea la boca?', options: ['Orbicular de los labios', 'Dorsal', 'Gemelo', 'Cuádriceps'], answer: 0, explanation: 'El orbicular de los labios rodea la boca y permite mover los labios.' },
  { topic: 'musculos', q: '¿Dónde está el esternocleidomastoideo?', options: ['En el cuello', 'En el pie', 'En la mano', 'En el abdomen'], answer: 0, explanation: 'El esternocleidomastoideo está a los lados del cuello y ayuda a mover la cabeza.' },
  { topic: 'musculos', q: '¿Dónde se encuentra el trapecio?', options: ['En la parte superior de la espalda y el cuello', 'En la palma de la mano', 'En los dedos del pie', 'En el abdomen'], answer: 0, explanation: 'El trapecio ocupa parte del cuello y de la zona superior de la espalda.' },
  { topic: 'musculos', q: '¿En qué zona se encuentra el músculo dorsal?', options: ['En la espalda', 'En la frente', 'En el pie', 'En la boca'], answer: 0, explanation: 'El dorsal es un músculo de la espalda.' },
  { topic: 'musculos', q: '¿Dónde se encuentra el glúteo?', options: ['En las nalgas', 'En el pecho', 'En la cara', 'En la muñeca'], answer: 0, explanation: 'Los glúteos están en la parte posterior de la cadera.' },
  { topic: 'musculos', q: '¿Dónde se encuentra el músculo tibial anterior?', options: ['En la parte delantera de la pierna', 'En el hombro', 'En la espalda', 'En la mandíbula'], answer: 0, explanation: 'El tibial anterior está en la parte delantera de la pierna, junto a la tibia.' },
  { topic: 'oido', q: '¿Qué parte del oído capta las ondas sonoras?', options: ['La oreja', 'El caracol', 'El nervio auditivo', 'El cerebro'], answer: 0, explanation: 'La oreja recoge las ondas sonoras y las dirige hacia el conducto auditivo.' },
  { topic: 'oido', q: '¿Qué parte vibra cuando recibe el sonido?', options: ['El tímpano', 'La pupila', 'La lengua', 'El iris'], answer: 0, explanation: 'El tímpano es una membrana fina que vibra al recibir las ondas sonoras.' },
  { topic: 'oido', q: '¿Qué hacen los huesecillos del oído?', options: ['Amplifican la vibración', 'Detectan sabores', 'Protegen el ojo', 'Producen luz'], answer: 0, explanation: 'La cadena de huesecillos transmite y amplifica las vibraciones.' },
  { topic: 'oido', q: '¿Qué parte convierte las vibraciones en señales nerviosas?', options: ['El caracol', 'La oreja', 'Las cejas', 'El conducto auditivo'], answer: 0, explanation: 'El caracol transforma las vibraciones en señales que viajarán al cerebro.' },
  { topic: 'oido', q: '¿Qué lleva las señales del oído al cerebro?', options: ['El nervio auditivo', 'El tímpano', 'La mandíbula', 'La pupila'], answer: 0, explanation: 'El nervio auditivo envía las señales desde el oído al cerebro.' },
  { topic: 'oido', q: 'Después de la oreja, ¿por dónde avanza el sonido?', options: ['Por el conducto auditivo', 'Por la pupila', 'Por la nariz', 'Por el iris'], answer: 0, explanation: 'La oreja dirige el sonido hacia el conducto auditivo y después al tímpano.' },
  { topic: 'oido', q: '¿Cómo se llaman los tres huesecillos del oído?', options: ['Martillo, yunque y estribo', 'Radio, cúbito y húmero', 'Tibia, peroné y fémur', 'Carpo, tarso y metatarso'], answer: 0, explanation: 'El martillo, el yunque y el estribo forman la cadena de huesecillos del oído.' },
  { topic: 'vista', q: '¿Por qué abertura entra la luz en el ojo?', options: ['Por la pupila', 'Por la ceja', 'Por el párpado', 'Por la pestaña'], answer: 0, explanation: 'La pupila es la abertura central por la que entra la luz.' },
  { topic: 'vista', q: '¿Qué parte coloreada del ojo regula cuánta luz entra?', options: ['El iris', 'La esclerótica', 'La ceja', 'La pestaña'], answer: 0, explanation: 'El iris es la parte coloreada que regula el tamaño de la pupila.' },
  { topic: 'vista', q: '¿Qué parte blanca y resistente protege y mantiene la forma del ojo?', options: ['La esclerótica', 'La pupila', 'El tímpano', 'La lengua'], answer: 0, explanation: 'La esclerótica es la capa blanca y resistente que rodea gran parte del ojo.' },
  { topic: 'vista', q: '¿Qué ayudan a desviar las cejas?', options: ['El sudor y el agua', 'Los sonidos', 'Los sabores', 'Los huesos'], answer: 0, explanation: 'Las cejas ayudan a desviar el sudor y el agua hacia los lados.' },
  { topic: 'vista', q: '¿Qué estructuras retienen polvo y ayudan a proteger los ojos?', options: ['Las pestañas', 'Las costillas', 'Los huesecillos', 'Las papilas gustativas'], answer: 0, explanation: 'Las pestañas ayudan a retener polvo y favorecen el parpadeo de defensa.' },
  { topic: 'vista', q: '¿Qué parte cubre y humedece el ojo al parpadear?', options: ['El párpado', 'El caracol', 'El fémur', 'El nervio auditivo'], answer: 0, explanation: 'Los párpados protegen el ojo y ayudan a repartir las lágrimas al parpadear.' },
  { topic: 'gusto', q: '¿Cuál de estos es uno de los cinco sabores básicos?', options: ['Umami', 'Crujiente', 'Picante', 'Frío'], answer: 0, explanation: 'Los cinco sabores básicos son dulce, salado, ácido, amargo y umami.' },
  { topic: 'gusto', q: '¿Qué sabor relacionamos con el limón?', options: ['Ácido', 'Salado', 'Umami', 'Dulce'], answer: 0, explanation: 'El limón es un ejemplo habitual de sabor ácido.' },
  { topic: 'gusto', q: '¿Qué sabor relacionamos con el azúcar?', options: ['Dulce', 'Amargo', 'Salado', 'Ácido'], answer: 0, explanation: 'El azúcar tiene sabor dulce.' },
  { topic: 'gusto', q: '¿Qué sabor puede recordar el café sin azúcar?', options: ['Amargo', 'Dulce', 'Salado', 'Ácido'], answer: 0, explanation: 'El café sin azúcar es un ejemplo de sabor amargo.' },
  { topic: 'gusto', q: '¿Qué estructuras de la lengua detectan los sabores?', options: ['Las papilas gustativas', 'Las pestañas', 'Las vértebras', 'Los huesecillos'], answer: 0, explanation: 'Las papilas gustativas contienen receptores que detectan sustancias relacionadas con el gusto.' },
  { topic: 'gusto', q: '¿Qué órgano interpreta la información del gusto?', options: ['El cerebro', 'El fémur', 'El tímpano', 'La rótula'], answer: 0, explanation: 'Las señales del gusto llegan al cerebro, que ayuda a interpretar los sabores.' },
  { topic: 'gusto', q: '¿Qué sabor básico predomina en unas patatas fritas de bolsa o en el jamón serrano?', options: ['Salado', 'Dulce', 'Amargo', 'Ácido'], answer: 0, explanation: 'Estos alimentos tienen un claro predominio del sabor salado.' },
  { topic: 'gusto', q: '¿Qué sabor básico puede encontrarse en el queso curado?', options: ['Umami', 'Dulce', 'Ácido', 'Amargo'], answer: 0, explanation: 'El umami es un sabor sabroso presente, por ejemplo, en el queso curado.' },
  // Huesos (6)
  { topic: 'huesos', q: '¿Qué hueso une el hombro con el esternón?', options: ['Omoplato', 'Clavícula', 'Húmero', 'Cúbito'], answer: 1, explanation: 'La clavícula es el hueso alargado que conecta la parte superior del esternón con el hombro.' },
  { topic: 'huesos', q: '¿Qué par de huesos se encuentra en la parte inferior de la pierna, entre la rodilla y el tobillo?', options: ['Radio y cúbito', 'Fémur y rótula', 'Tibia y peroné', 'Carpo y metacarpo'], answer: 2, explanation: 'La tibia y el peroné forman la pierna por debajo de la rodilla, mientras que radio y cúbito están en el antebrazo.' },
  { topic: 'huesos', q: '¿Cuál de estos huesos NO forma parte del cráneo?', options: ['Frontal', 'Parietal', 'Temporal', 'Esternón'], answer: 3, explanation: 'Frontal, parietal y temporal son huesos del cráneo; el esternón está en el centro del pecho.' },
  { topic: 'huesos', q: '¿Qué hueso protege directamente la articulación de la rodilla por delante?', options: ['Rótula', 'Peroné', 'Tarso', 'Pelvis'], answer: 0, explanation: 'La rótula es un hueso corto situado delante de la rodilla que protege la articulación.' },
  { topic: 'huesos', q: '¿Qué huesos forman la palma de la mano, entre la muñeca y los dedos?', options: ['Carpo', 'Metacarpo', 'Metatarso', 'Falanges'], answer: 1, explanation: 'El carpo es la muñeca, el metacarpo forma la palma y las falanges son los huesos de los dedos.' },
  { topic: 'huesos', q: '¿Cuál de estos huesos se encuentra en la parte superior de la espalda?', options: ['Maxilar', 'Esternón', 'Omoplato', 'Vértebra lumbar'], answer: 2, explanation: 'El omoplato (o escápula) es un hueso plano situado en la parte superior de la espalda, cerca del hombro.' },
  // Músculos (6)
  { topic: 'musculos', q: 'Cuando doblas el brazo por el codo, ¿qué músculo de la parte delantera se contrae principalmente?', options: ['Tríceps', 'Bíceps', 'Deltoides', 'Trapecio'], answer: 1, explanation: 'El bíceps está en la parte delantera del brazo y se contrae al doblar el codo; el tríceps lo estira.' },
  { topic: 'musculos', q: '¿Qué músculo de la pierna se encuentra en la parte delantera del muslo y ayuda a estirar la rodilla?', options: ['Gemelo', 'Bíceps femoral', 'Cuádriceps', 'Tibial anterior'], answer: 2, explanation: 'El cuádriceps ocupa la parte delantera del muslo; el bíceps femoral está detrás y el gemelo en la pantorrilla.' },
  { topic: 'musculos', q: '¿Cuál de estos músculos participa directamente en la masticación?', options: ['Esternocleidomastoideo', 'Orbicular de los labios', 'Trapecio', 'Masetero'], answer: 3, explanation: 'El masetero mueve la mandíbula con fuerza para masticar los alimentos.' },
  { topic: 'musculos', q: '¿Qué músculo te permite levantar el brazo lateralmente desde el hombro?', options: ['Deltoides', 'Pectoral', 'Dorsal', 'Bíceps'], answer: 0, explanation: 'El deltoides cubre el hombro y participa en el movimiento de elevar el brazo.' },
  { topic: 'musculos', q: '¿Qué músculo se sitúa a los lados del cuello y permite girar o inclinar la cabeza?', options: ['Masetero', 'Esternocleidomastoideo', 'Orbicular de los párpados', 'Pectoral'], answer: 1, explanation: 'El esternocleidomastoideo recorre los lados del cuello y ayuda a mover la cabeza.' },
  { topic: 'musculos', q: '¿Qué diferencia al bíceps femoral del cuádriceps?', options: ['El bíceps femoral está en el brazo y el cuádriceps en el muslo', 'El bíceps femoral está en la pantorrilla y el cuádriceps en el pie', 'El bíceps femoral está detrás del muslo y el cuádriceps delante', 'Ambos están en la espalda'], answer: 2, explanation: 'Los dos están en el muslo, pero el cuádriceps ocupa la parte delantera y el bíceps femoral la parte posterior.' },
  // Oído (6)
  { topic: 'oido', q: '¿En qué orden viaja el sonido desde el exterior hasta el cerebro?', options: ['Oreja → tímpano → conducto auditivo → caracol → nervio auditivo', 'Oreja → conducto auditivo → tímpano → huesecillos → caracol → nervio auditivo', 'Conducto auditivo → oreja → huesecillos → tímpano → caracol', 'Oreja → caracol → tímpano → huesecillos → nervio auditivo'], answer: 1, explanation: 'El sonido entra por la oreja, recorre el conducto auditivo, hace vibrar el tímpano, pasa por los huesecillos, llega al caracol y viaja por el nervio auditivo.' },
  { topic: 'oido', q: '¿Qué estructura del oído transforma las vibraciones en señales nerviosas?', options: ['El tímpano', 'El martillo', 'El caracol', 'El conducto auditivo'], answer: 2, explanation: 'El caracol (cóclea) convierte las vibraciones del sonido en señales nerviosas para el cerebro.' },
  { topic: 'oido', q: '¿Cuál es la función principal de la cadena de huesecillos?', options: ['Recoger las ondas del aire', 'Producir cera protectora', 'Enviar señales directamente al cerebro', 'Transmitir y amplificar las vibraciones del tímpano'], answer: 3, explanation: 'El martillo, el yunque y el estribo transmiten y amplifican las vibraciones desde el tímpano hasta el caracol.' },
  { topic: 'oido', q: '¿Cuál de estos NO es uno de los tres huesecillos del oído?', options: ['Yunque', 'Estribo', 'Caracol', 'Martillo'], answer: 2, explanation: 'Los tres huesecillos son martillo, yunque y estribo; el caracol es una estructura distinta del oído interno.' },
  { topic: 'oido', q: '¿Qué parte del oído vibra primero al recibir las ondas sonoras que llegan por el conducto auditivo?', options: ['El tímpano', 'El estribo', 'El nervio auditivo', 'La oreja'], answer: 0, explanation: 'El tímpano es la membrana que separa el oído externo del medio y vibra al recibir las ondas sonoras.' },
  { topic: 'oido', q: 'Si se dañara el nervio auditivo, ¿qué ocurriría principalmente?', options: ['No vibraría la oreja', 'Las señales del caracol no llegarían al cerebro', 'El tímpano dejaría de recibir aire', 'Los huesecillos crecerían más'], answer: 1, explanation: 'El nervio auditivo es el encargado de llevar las señales nerviosas desde el caracol hasta el cerebro.' },
  // Vista (6)
  { topic: 'vista', q: 'Cuando pasas de una habitación oscura a un lugar muy soleado, ¿qué parte del ojo reduce el tamaño de la pupila?', options: ['La esclerótica', 'El párpado', 'El iris', 'La ceja'], answer: 2, explanation: 'El iris es la parte coloreada del ojo y regula cuánta luz entra abriendo o cerrando la pupila.' },
  { topic: 'vista', q: '¿Qué diferencia hay entre la pupila y el iris?', options: ['La pupila es la capa blanca y el iris la abertura', 'La pupila es la abertura por donde entra la luz y el iris es la parte coloreada que la regula', 'Ambos sirven para desviar el sudor', 'La pupila está en el párpado y el iris en la ceja'], answer: 1, explanation: 'La pupila es el orificio central por el que entra la luz, y el iris es el músculo coloreado que la rodea y regula su tamaño.' },
  { topic: 'vista', q: '¿Qué función comparten las cejas y las pestañas?', options: ['Regular la cantidad de luz que entra', 'Dar color al ojo', 'Proteger el ojo frente a elementos externos como sudor o polvo', 'Humedecer el ojo al parpadear'], answer: 2, explanation: 'Las cejas desvían el sudor y el agua, y las pestañas retienen el polvo; ambas protegen el ojo.' },
  { topic: 'vista', q: '¿Cuál es la función principal de la esclerótica?', options: ['Permitir el paso de la luz al interior', 'Proteger y mantener la forma del ojo con una capa blanca y resistente', 'Cambiar de tamaño según la luz', 'Repartir las lágrimas'], answer: 1, explanation: 'La esclerótica es la parte blanca y resistente que envuelve y protege el globo ocular.' },
  { topic: 'vista', q: '¿Qué ocurre gracias al parpadeo de los párpados?', options: ['Se regula la luz que entra por la pupila', 'Se desvía el sudor de la frente', 'Se humedece y limpia la superficie del ojo', 'Se envían imágenes al cerebro'], answer: 2, explanation: 'Al parpadear, los párpados reparten las lágrimas para mantener el ojo húmedo y limpio.' },
  { topic: 'vista', q: '¿Qué parte del ojo NO tiene una función principalmente protectora externa?', options: ['La ceja', 'La pestaña', 'El párpado', 'La pupila'], answer: 3, explanation: 'Cejas, pestañas y párpados protegen el ojo desde el exterior; la pupila es la abertura por la que entra la luz.' },
  // Gusto (6)
  { topic: 'gusto', q: '¿Cuál de estos sabores NO forma parte de los cinco sabores básicos?', options: ['Umami', 'Amargo', 'Picante', 'Ácido'], answer: 2, explanation: 'Los cinco sabores básicos son dulce, salado, ácido, amargo y umami; el picante no es un sabor básico.' },
  { topic: 'gusto', q: '¿Dónde se encuentran las papilas gustativas y qué hacen?', options: ['En el paladar, y producen saliva', 'En la lengua, y detectan sustancias relacionadas con los sabores', 'En los dientes, y trituran la comida', 'En el cerebro, e interpretan los olores'], answer: 1, explanation: 'Las papilas gustativas están en la lengua y contienen receptores que detectan los sabores.' },
  { topic: 'gusto', q: '¿Qué alimento es un ejemplo típico del sabor umami?', options: ['Limón', 'Azúcar', 'Queso curado', 'Café sin azúcar'], answer: 2, explanation: 'El umami es un sabor sabroso presente en alimentos como el queso curado o el tomate.' },
  { topic: 'gusto', q: 'Si pruebas un alimento y notas un sabor ácido, ¿con cuál de estos se relaciona más?', options: ['Vinagre o limón', 'Sal común', 'Miel', 'Queso curado'], answer: 0, explanation: 'El limón y el vinagre son ejemplos habituales de sabor ácido.' },
  { topic: 'gusto', q: '¿Qué papel cumple el cerebro en el sentido del gusto?', options: ['Produce la saliva necesaria para disolver la comida', 'Recibe las señales de las papilas gustativas e interpreta el sabor', 'Mueve la lengua al masticar', 'Almacena los cinco sabores básicos'], answer: 1, explanation: 'Las papilas gustativas envían señales al cerebro, que es el órgano encargado de interpretar los sabores.' },
  { topic: 'gusto', q: '¿Cuál de estas parejas alimento-sabor es correcta?', options: ['Café sin azúcar - dulce', 'Limón - amargo', 'Yogur natural sin azúcar - ácido', 'Azúcar - umami'], answer: 2, explanation: 'El yogur natural sin azúcar tiene un toque ácido; el café sin azúcar es amargo, el limón es ácido y el azúcar es dulce.' }
];

const DIAGRAMS = {
  huesos: {
    title: 'El esqueleto humano',
    instruction: 'Arrastra cada hueso a su lugar en el dibujo.',
    viewBox: '0 0 360 380',
    svg: `
      <g fill="#f7efe2" stroke="#25483f" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="180" cy="46" r="26"/>
        <path d="M168 70v18h24V70"/>
        <path d="M132 94h96"/>
        <path d="M180 88v110"/>
        <path d="M148 106q32 10 64 0M144 122q36 12 72 0M146 138q34 12 68 0M152 154q28 10 56 0"/>
        <path d="M148 196q32 22 64 0l-6 26q-26 10-52 0z"/>
        <path d="M132 94l-26 62-14 54"/>
        <path d="M228 94l26 62 14 54"/>
        <path d="M160 222l-10 66-6 66"/>
        <path d="M200 222l10 66 6 66"/>
        <circle cx="150" cy="288" r="7" fill="#ffd97d"/>
        <circle cx="210" cy="288" r="7" fill="#ffd97d"/>
      </g>
    `,
    zones: [
      { id: 'craneo', label: 'Cráneo (Frontal)', x: 50, y: 12 },
      { id: 'clavicula', label: 'Clavícula', x: 64, y: 24 },
      { id: 'costillas', label: 'Costillas', x: 50, y: 35 },
      { id: 'humero', label: 'Húmero', x: 28, y: 33 },
      { id: 'pelvis', label: 'Pelvis', x: 50, y: 54 },
      { id: 'femur', label: 'Fémur', x: 40, y: 68 },
      { id: 'rotula', label: 'Rótula', x: 58, y: 76 },
      { id: 'tibia', label: 'Tibia', x: 40, y: 88 }
    ]
  },
  musculos: {
    title: 'Los músculos del cuerpo',
    instruction: 'Arrastra cada músculo a su zona correspondiente.',
    viewBox: '0 0 360 380',
    svg: `
      <g fill="#f6a08b" stroke="#25483f" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="180" cy="44" r="24" fill="#fde4d8"/>
        <path d="M168 68l12 18 12-18" fill="#f6a08b"/>
        <path d="M130 92q50-10 100 0l-10 104q-40 16-80 0z"/>
        <path d="M142 104q18 18 36 0M182 104q18 18 36 0" fill="none"/>
        <path d="M160 136h40M160 154h40M162 172h36" fill="none"/>
        <path d="M130 92l-26 58-12 52h16l14-48 12-40"/>
        <path d="M230 92l26 58 12 52h-16l-14-48-12-40"/>
        <path d="M146 202l-10 76-4 72h20l8-72 14-70"/>
        <path d="M214 202l10 76 4 72h-20l-8-72-14-70"/>
      </g>
    `,
    zones: [
      { id: 'deltoides', label: 'Deltoides', x: 32, y: 26 },
      { id: 'pectoral', label: 'Pectoral', x: 58, y: 29 },
      { id: 'biceps', label: 'Bíceps', x: 26, y: 39 },
      { id: 'abdominales', label: 'Abdominales', x: 50, y: 43 },
      { id: 'cuadriceps', label: 'Cuádriceps', x: 41, y: 64 },
      { id: 'gemelo', label: 'Gemelo', x: 61, y: 82 }
    ]
  },
  oido: {
    title: 'Partes del oído',
    instruction: 'Arrastra cada parte del oído a su lugar en el esquema.',
    viewBox: '0 0 380 240',
    svg: `
      <g fill="none" stroke="#25483f" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <path d="M58 64c-26 0-36 30-28 60 6 24 22 44 40 42 12-1 18-14 14-28-3-10-12-14-12-26 0-16 14-24 14-36 0-8-12-12-28-12z" fill="#fbd7c4"/>
        <path d="M84 106h96M84 126h96" fill="#fdebe0"/>
        <ellipse cx="184" cy="116" rx="8" ry="20" fill="#ffd97d"/>
        <path d="M192 110l20-12 18 14 20-6" stroke-width="4"/>
        <path d="M254 114c0-22 28-26 36-8 6 14-4 32-20 32-12 0-18-10-14-20 3-8 12-8 14-2" fill="#cde8f6"/>
        <path d="M292 104l48-16M292 118l48 10" stroke="#4f83cc" stroke-width="4"/>
      </g>
    `,
    zones: [
      { id: 'oreja', label: 'Oreja', x: 14, y: 48 },
      { id: 'conducto', label: 'Conducto auditivo', x: 34, y: 48 },
      { id: 'timpano', label: 'Tímpano', x: 48, y: 48 },
      { id: 'huesecillos', label: 'Huesecillos', x: 58, y: 40 },
      { id: 'caracol', label: 'Caracol', x: 72, y: 48 },
      { id: 'nervio', label: 'Nervio auditivo', x: 87, y: 46 }
    ]
  },
  vista: {
    title: 'Partes del ojo',
    instruction: 'Arrastra cada parte del ojo a su lugar correcto.',
    viewBox: '0 0 380 240',
    svg: `
      <g stroke="#25483f" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <path d="M70 52q120-26 240 0" fill="none" stroke-width="8"/>
        <path d="M110 88l-8-14M145 78l-4-16M190 74v-16M235 78l4-16M270 88l8-14" fill="none"/>
        <path d="M70 128q120-70 240 0q-120 70-240 0z" fill="#ffffff"/>
        <circle cx="190" cy="128" r="44" fill="#63b38b"/>
        <circle cx="190" cy="128" r="20" fill="#18322c"/>
        <circle cx="182" cy="120" r="6" fill="#ffffff" stroke="none"/>
      </g>
    `,
    zones: [
      { id: 'ceja', label: 'Ceja', x: 50, y: 18 },
      { id: 'pestanas', label: 'Pestañas', x: 38, y: 31 },
      { id: 'esclerotica', label: 'Esclerótica', x: 29, y: 54 },
      { id: 'iris', label: 'Iris', x: 58, y: 54 },
      { id: 'pupila', label: 'Pupila', x: 50, y: 53 },
      { id: 'parpado', label: 'Párpado', x: 50, y: 74 }
    ]
  },
  gusto: {
    title: 'El sentido del gusto',
    instruction: 'Arrastra cada elemento a su lugar en la lengua y los sabores.',
    viewBox: '0 0 380 240',
    svg: `
      <g stroke="#25483f" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <path d="M120 40c0 95 25 160 70 160s70-65 70-160z" fill="#f79ca8"/>
        <path d="M190 45v120" fill="none" opacity=".35"/>
        <circle cx="155" cy="85" r="7" fill="#fff3b0"/>
        <circle cx="225" cy="85" r="7" fill="#fff3b0"/>
        <circle cx="150" cy="130" r="7" fill="#b8e0d2"/>
        <circle cx="230" cy="130" r="7" fill="#b8e0d2"/>
        <circle cx="190" cy="165" r="8" fill="#ffd6a5"/>
      </g>
    `,
    zones: [
      { id: 'amargo', label: 'Amargo (fondo)', x: 50, y: 26 },
      { id: 'acido', label: 'Ácido (lados)', x: 39, y: 54 },
      { id: 'papilas', label: 'Papilas gustativas', x: 60, y: 35 },
      { id: 'salado', label: 'Salado (lados/delante)', x: 61, y: 54 },
      { id: 'dulce', label: 'Dulce (punta)', x: 50, y: 70 }
    ]
  }
};