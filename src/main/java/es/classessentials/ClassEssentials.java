package es.classessentials;

import javax.swing.*;
import javax.swing.border.EmptyBorder;
import java.awt.*;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Random;

public class ClassEssentials extends JFrame {

    // =========================================================
    // PALETA ROSA PASTEL
    // =========================================================

    private static final Color FONDO = new Color(255, 241, 246);
    private static final Color TARJETA = Color.WHITE;
    private static final Color ROSA_SUAVE = new Color(253, 226, 236);
    private static final Color ROSA = new Color(244, 143, 177);
    private static final Color ROSA_FUERTE = new Color(214, 84, 133);
    private static final Color BORDE = new Color(248, 208, 224);
    private static final Color TEXTO = new Color(84, 48, 66);
    private static final Color GRIS = new Color(160, 125, 142);
    private static final Color VERDE = new Color(88, 187, 135);
    private static final Color AMARILLO = new Color(232, 165, 60);
    private static final Color ROJO = new Color(226, 85, 105);
    private static final Color CREMA = new Color(255, 245, 219);

    // =========================================================
    // FUENTES
    // =========================================================

    private static final Font F_NORMAL = new Font("Segoe UI", Font.PLAIN, 14);
    private static final Font F_SMALL = new Font("Segoe UI", Font.PLAIN, 13);
    private static final Font F_BOLD = new Font("Segoe UI", Font.BOLD, 15);
    private static final Font F_BOTON = new Font("Segoe UI", Font.BOLD, 14);
    private static final Font F_TITULO = new Font("Segoe UI", Font.BOLD, 30);
    private static final Font F_SECCION = new Font("Segoe UI", Font.BOLD, 19);

    // =========================================================
    // ASIGNATURAS (nombre, profesorado) Y COLORES
    // =========================================================

    private static final String[] ENT = { "Entornos de Desarrollo", "Lop, Al, An" };
    private static final String[] BD = { "Bases de Datos", "Castri, Es" };
    private static final String[] LM = { "Lenguaje de Marcas", "Castri, Es" };
    private static final String[] PROG = { "Programación", "Ale, Go, Br" };
    private static final String[] SI = { "Sistemas Informáticos", "Gómez, Ja" };
    private static final String[] OPT = { "Módulo Optativo", "Ale, Go, Br" };
    private static final String[] ITI = { "Itinerario Personal para la Empleabilidad", "Guil Sa, M." };

    private static final Map<String, Color> COLORES = new HashMap<>();
    private static final Map<String, String> CORTOS = new HashMap<>();

    static {
        COLORES.put(ENT[0], new Color(203, 226, 255));
        COLORES.put(BD[0], new Color(255, 238, 196));
        COLORES.put(LM[0], new Color(214, 238, 200));
        COLORES.put(PROG[0], new Color(255, 208, 184));
        COLORES.put(SI[0], new Color(196, 240, 224));
        COLORES.put(OPT[0], new Color(255, 196, 216));
        COLORES.put(ITI[0], new Color(226, 208, 248));

        CORTOS.put(ENT[0], "Entornos");
        CORTOS.put(BD[0], "Bases de Datos");
        CORTOS.put(LM[0], "Leng. de Marcas");
        CORTOS.put(PROG[0], "Programación");
        CORTOS.put(SI[0], "Sist. Informáticos");
        CORTOS.put(OPT[0], "Optativo");
        CORTOS.put(ITI[0], "Itinerario Empl.");
    }

    private static Color colorDe(String asignatura) {
        return COLORES.getOrDefault(asignatura, ROSA_SUAVE);
    }

    // =========================================================
    // TRAMOS HORARIOS
    // =========================================================

    private static final String[] TRAMOS = {
            "8:30–9:25", "9:25–10:15",
            "10:30–11:25", "11:25–12:15",
            "12:30–13:25", "13:25–14:15"
    };

    private static final String[] RECREOS = { "10:15–10:30", "12:15–12:30" };

    private static final String AULA = "AULA DAM 1";

    // =========================================================
    // DATOS
    // =========================================================

    private static final int LIMITE_MATRICULA = 150;

    private final Map<String, Integer> limites = new LinkedHashMap<>();
    private final Map<String, JTextField> camposInjustificadas = new LinkedHashMap<>();
    private final Map<String, JTextField> camposJustificadas = new LinkedHashMap<>();

    private final Map<DayOfWeek, String[][]> horario = new LinkedHashMap<>();
    private final Map<LocalDate, String> diasSinClase = new LinkedHashMap<>();
    private final List<Periodo> periodos = new ArrayList<>();

    private LocalDate fechaHorario;

    private JPanel resultadosPanel;
    private JLabel fechaHorarioLabel;
    private JPanel tablaHorarioPanel;

    private final CardLayout cartas = new CardLayout();
    private final JPanel contenedor = new JPanel(cartas);
    private static final String[] IDS = { "faltas", "horario", "semana", "chat" };
    private static final String[] TITULOS = { "📊  Faltas", "📅  Horario", "🗓  Semana", "💬  Chat" };
    private final Boton[] botonesNav = new Boton[IDS.length];

    private static final DateTimeFormatter FORMATO_FECHA = DateTimeFormatter.ofPattern("EEEE d 'de' MMMM 'de' yyyy",
            Locale.forLanguageTag("es-ES"));

    private static final DateTimeFormatter FORMATO_CORTO = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter FORMATO_HORA = DateTimeFormatter.ofPattern("HH:mm");

    // =========================================================
    // DATOS DEL CHAT (SIMULADO)
    // =========================================================

    private static final String YO = "Tú";

    private static final String[] RESPUESTAS = {
            "¡Jajaja, totalmente! 😄", "Vale, luego lo miramos", "¿Alguien tiene los apuntes de hoy?",
            "Yo estoy en la biblioteca 📚", "Ni idea, pregúntale al profe", "¡Genial! 🌸",
            "Me apunto 🙌", "Uf, qué pereza el lunes...", "¿Quedamos en el recreo?",
            "Ahora te lo paso", "Se me había olvidado por completo 😅", "¡Ánimo con la entrega!"
    };

    private final List<String> amigos = new ArrayList<>();
    private final DefaultListModel<Conversacion> modeloChats = new DefaultListModel<>();
    private final Random random = new Random();

    private JList<Conversacion> listaChats;
    private JPanel mensajesPanel;
    private JScrollPane mensajesScroll;
    private JLabel chatTitulo;
    private JLabel chatSubtitulo;
    private JTextField campoMensaje;

    // =========================================================
    // COMPONENTES PERSONALIZADOS
    // =========================================================

    /** Panel con esquinas redondeadas. */
    private static class Redondo extends JPanel {
        private final Color color;
        private final int arco;
        private final Color contorno;

        Redondo(LayoutManager lm, Color color, int arco) {
            this(lm, color, arco, null);
        }

        Redondo(LayoutManager lm, Color color, int arco, Color contorno) {
            super(lm);
            this.color = color;
            this.arco = arco;
            this.contorno = contorno;
            setOpaque(false);
        }

        @Override
        protected void paintComponent(Graphics g) {
            Graphics2D g2 = (Graphics2D) g.create();
            g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            g2.setColor(color);
            g2.fillRoundRect(0, 0, getWidth(), getHeight(), arco, arco);
            if (contorno != null) {
                g2.setColor(contorno);
                g2.drawRoundRect(0, 0, getWidth() - 1, getHeight() - 1, arco, arco);
            }
            g2.dispose();
            super.paintComponent(g);
        }
    }

    /** Botón redondeado con efecto hover. */
    private static class Boton extends JButton {
        private Color fondo = TARJETA;
        private boolean encima = false;

        Boton(String texto) {
            super(texto);
            setFont(F_BOTON);
            setForeground(ROSA_FUERTE);
            setContentAreaFilled(false);
            setBorderPainted(false);
            setFocusPainted(false);
            setOpaque(false);
            setBorder(new EmptyBorder(9, 18, 9, 18));
            setCursor(new Cursor(Cursor.HAND_CURSOR));
            addMouseListener(new MouseAdapter() {
                @Override
                public void mouseEntered(MouseEvent e) {
                    encima = true;
                    repaint();
                }

                @Override
                public void mouseExited(MouseEvent e) {
                    encima = false;
                    repaint();
                }
            });
        }

        void estilo(Color fondo, Color texto) {
            this.fondo = fondo;
            setForeground(texto);
            repaint();
        }

        @Override
        protected void paintComponent(Graphics g) {
            Graphics2D g2 = (Graphics2D) g.create();
            g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            g2.setColor(encima ? mezclar(fondo, ROSA_FUERTE, 0.12f) : fondo);
            g2.fillRoundRect(0, 0, getWidth(), getHeight(), 22, 22);
            g2.setColor(BORDE);
            g2.drawRoundRect(0, 0, getWidth() - 1, getHeight() - 1, 22, 22);
            g2.dispose();
            super.paintComponent(g);
        }
    }

    /** Barra de progreso redondeada. */
    private static class Barra extends JComponent {
        private final int valor;
        private final int max;
        private final Color color;

        Barra(int valor, int max, Color color) {
            this.valor = valor;
            this.max = max;
            this.color = color;
            setPreferredSize(new Dimension(100, 12));
        }

        @Override
        protected void paintComponent(Graphics g) {
            Graphics2D g2 = (Graphics2D) g.create();
            g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            int h = getHeight();
            g2.setColor(ROSA_SUAVE);
            g2.fillRoundRect(0, 0, getWidth(), h, h, h);
            int w = (int) (getWidth() * Math.min(1.0, (double) valor / max));
            if (w > 0) {
                g2.setColor(color);
                g2.fillRoundRect(0, 0, Math.max(w, h), h, h, h);
            }
            g2.dispose();
        }
    }

    private static class Periodo {
        final LocalDate inicio;
        final LocalDate fin;
        final String motivo;

        Periodo(LocalDate inicio, LocalDate fin, String motivo) {
            this.inicio = inicio;
            this.fin = fin;
            this.motivo = motivo;
        }
    }

    // ---------- Modelo del chat ----------

    private static class Mensaje {
        final String autor;
        final String texto;
        final LocalTime hora;

        Mensaje(String autor, String texto) {
            this.autor = autor;
            this.texto = texto;
            this.hora = LocalTime.now();
        }
    }

    private static class Conversacion {
        String nombre;
        final boolean grupo;
        final List<String> miembros = new ArrayList<>();
        final List<Mensaje> mensajes = new ArrayList<>();

        Conversacion(String nombre, boolean grupo) {
            this.nombre = nombre;
            this.grupo = grupo;
        }

        @Override
        public String toString() {
            return nombre;
        }
    }

    private static class ResultadoGrupo {
        final String nombre;
        final List<String> miembros;

        ResultadoGrupo(String nombre, List<String> miembros) {
            this.nombre = nombre;
            this.miembros = miembros;
        }
    }

    // =========================================================
    // UTILIDADES
    // =========================================================

    private static Color mezclar(Color a, Color b, float t) {
        return new Color(
                Math.round(a.getRed() + (b.getRed() - a.getRed()) * t),
                Math.round(a.getGreen() + (b.getGreen() - a.getGreen()) * t),
                Math.round(a.getBlue() + (b.getBlue() - a.getBlue()) * t));
    }

    private static JLabel etiqueta(String texto, Font fuente, Color color) {
        JLabel l = new JLabel(texto);
        l.setFont(fuente);
        l.setForeground(color);
        return l;
    }

    private static JLabel etiquetaCentrada(String texto, Font fuente, Color color) {
        JLabel l = etiqueta(texto, fuente, color);
        l.setHorizontalAlignment(SwingConstants.CENTER);
        return l;
    }

    private static <T extends JComponent> T izq(T c) {
        c.setAlignmentX(Component.LEFT_ALIGNMENT);
        return c;
    }

    private static String capitalizar(String t) {
        return (t == null || t.isEmpty()) ? t : t.substring(0, 1).toUpperCase() + t.substring(1);
    }

    private static String esc(String t) {
        return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }

    private JPanel crearCabecera(String titulo, String subtitulo) {
        JPanel p = new JPanel();
        p.setLayout(new BoxLayout(p, BoxLayout.Y_AXIS));
        p.setOpaque(false);
        p.add(etiqueta(titulo, F_TITULO, TEXTO));
        p.add(Box.createVerticalStrut(4));
        p.add(etiqueta(subtitulo, F_NORMAL, GRIS));
        return p;
    }

    private static void addGrid(JPanel p, JComponent c, int x, int y, int w, int h, double wx, double wy) {
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.gridx = x;
        gbc.gridy = y;
        gbc.gridwidth = w;
        gbc.gridheight = h;
        gbc.weightx = wx;
        gbc.weighty = wy;
        gbc.fill = GridBagConstraints.BOTH;
        gbc.insets = new Insets(4, 4, 4, 4);
        p.add(c, gbc);
    }

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public ClassEssentials() {
        configurarLimites();
        configurarHorario();
        configurarDiasSinClase();
        configurarChat();

        fechaHorario = LocalDate.now();

        configurarVentana();
        crearInterfaz();

        setVisible(true);
    }

    // =========================================================
    // CONFIGURACIÓN
    // =========================================================

    private void configurarLimites() {
        limites.put("Bases de Datos", 31);
        limites.put("Entornos de Desarrollo", 9);
        limites.put("Lenguaje de Marcas", 17);
        limites.put("Programación", 41);
        limites.put("Sistemas Informáticos", 31);
        limites.put("Módulo Optativo", 8);
        limites.put("Itinerario Personal para la Empleabilidad", 15);
    }

    /**
     * Cada día tiene 6 tramos de clase:
     * 8:30 · 9:25 · (recreo) · 10:30 · 11:25 · (recreo) · 12:30 · 13:25
     */
    private void configurarHorario() {
        horario.put(DayOfWeek.MONDAY, new String[][] { ENT, ENT, BD, BD, PROG, PROG });
        horario.put(DayOfWeek.TUESDAY, new String[][] { OPT, BD, BD, ITI, ITI, LM });
        horario.put(DayOfWeek.WEDNESDAY, new String[][] { BD, BD, PROG, PROG, SI, SI });
        horario.put(DayOfWeek.THURSDAY, new String[][] { LM, LM, PROG, PROG, SI, SI });
        horario.put(DayOfWeek.FRIDAY, new String[][] { ITI, PROG, PROG, SI, SI, OPT });
    }

    private void configurarDiasSinClase() {
        agregarPeriodo(LocalDate.of(2026, 10, 12), LocalDate.of(2026, 10, 12), "Fiesta Nacional de España");
        agregarPeriodo(LocalDate.of(2026, 11, 2), LocalDate.of(2026, 11, 2), "Día no lectivo");
        agregarPeriodo(LocalDate.of(2026, 12, 7), LocalDate.of(2026, 12, 7), "Día no lectivo");
        agregarPeriodo(LocalDate.of(2026, 12, 8), LocalDate.of(2026, 12, 8), "Inmaculada Concepción");
        agregarPeriodo(LocalDate.of(2026, 12, 23), LocalDate.of(2027, 1, 10), "Vacaciones de Navidad");
        agregarPeriodo(LocalDate.of(2027, 2, 12), LocalDate.of(2027, 2, 12), "Día no lectivo");
        agregarPeriodo(LocalDate.of(2027, 2, 15), LocalDate.of(2027, 2, 15), "Día no lectivo");
        agregarPeriodo(LocalDate.of(2027, 3, 19), LocalDate.of(2027, 3, 29), "Vacaciones de Semana Santa");
    }

    private void agregarPeriodo(LocalDate inicio, LocalDate fin, String motivo) {
        periodos.add(new Periodo(inicio, fin, motivo));
        LocalDate f = inicio;
        while (!f.isAfter(fin)) {
            diasSinClase.put(f, motivo);
            f = f.plusDays(1);
        }
    }

    private void configurarChat() {
        String[] iniciales = { "Lucía", "Carlos", "Marta", "Pablo", "Sofía" };
        String[] saludos = { "¡Hola! ¿Qué tal el finde?", "¿Hiciste la práctica de BD?",
                "Buenas 🌸", "¿Vamos juntos a clase?", "Hola hola, ¿todo bien?" };

        for (int i = 0; i < iniciales.length; i++) {
            amigos.add(iniciales[i]);
            Conversacion c = new Conversacion(iniciales[i], false);
            c.miembros.add(iniciales[i]);
            c.mensajes.add(new Mensaje(iniciales[i], saludos[i]));
            modeloChats.addElement(c);
        }

        Conversacion clase = new Conversacion("DAM 1 · Clase", true);
        clase.miembros.add("Lucía");
        clase.miembros.add("Carlos");
        clase.miembros.add("Marta");
        clase.mensajes.add(new Mensaje("Marta", "¿Alguien sabe cuándo es el examen de Programación?"));
        clase.mensajes.add(new Mensaje("Carlos", "Creo que la semana que viene 😬"));
        modeloChats.add(0, clase);
    }

    private void configurarVentana() {
        setTitle("ClassEssentials");
        setSize(1180, 830);
        setMinimumSize(new Dimension(1000, 720));
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);
    }

    // =========================================================
    // INTERFAZ PRINCIPAL
    // =========================================================

    private void crearInterfaz() {
        JPanel raiz = new JPanel(new BorderLayout());
        raiz.setBackground(FONDO);

        JPanel nav = new JPanel(new BorderLayout());
        nav.setOpaque(false);
        nav.setBorder(new EmptyBorder(20, 30, 0, 30));
        nav.add(etiqueta("🌸 ClassEssentials", F_SECCION, ROSA_FUERTE), BorderLayout.WEST);

        JPanel botones = new JPanel(new FlowLayout(FlowLayout.RIGHT, 8, 0));
        botones.setOpaque(false);

        for (int i = 0; i < IDS.length; i++) {
            final String id = IDS[i];
            Boton b = new Boton(TITULOS[i]);
            b.addActionListener(e -> mostrar(id));
            botonesNav[i] = b;
            botones.add(b);
        }
        nav.add(botones, BorderLayout.EAST);

        contenedor.setOpaque(false);
        contenedor.add(crearPanelFaltas(), IDS[0]);
        contenedor.add(crearPanelHorario(), IDS[1]);
        contenedor.add(crearPanelSemana(), IDS[2]);
        contenedor.add(crearPanelChat(), IDS[3]);

        raiz.add(nav, BorderLayout.NORTH);
        raiz.add(contenedor, BorderLayout.CENTER);
        setContentPane(raiz);

        mostrar(IDS[0]);
    }

    private void mostrar(String id) {
        cartas.show(contenedor, id);
        for (int i = 0; i < IDS.length; i++) {
            boolean activo = IDS[i].equals(id);
            botonesNav[i].estilo(activo ? ROSA : TARJETA, activo ? Color.WHITE : ROSA_FUERTE);
        }
    }

    // =========================================================
    // PANEL FALTAS
    // =========================================================

    private JPanel crearPanelFaltas() {
        JPanel principal = new JPanel(new BorderLayout(20, 20));
        principal.setOpaque(false);
        principal.setBorder(new EmptyBorder(20, 30, 25, 30));

        principal.add(crearCabecera("Calculadora de Faltas",
                "Control de asistencia · Grado Superior DAM"), BorderLayout.NORTH);

        resultadosPanel = new JPanel();
        resultadosPanel.setLayout(new BoxLayout(resultadosPanel, BoxLayout.Y_AXIS));
        resultadosPanel.setOpaque(false);

        JPanel envoltorio = new JPanel(new BorderLayout());
        envoltorio.setOpaque(false);
        envoltorio.add(resultadosPanel, BorderLayout.NORTH);

        JScrollPane scroll = new JScrollPane(envoltorio);
        scroll.setBorder(null);
        scroll.getViewport().setBackground(FONDO);
        scroll.getVerticalScrollBar().setUnitIncrement(16);
        scroll.getVerticalScrollBar().setPreferredSize(new Dimension(8, 0));

        JPanel resultados = new JPanel(new BorderLayout(0, 12));
        resultados.setOpaque(false);
        resultados.add(etiqueta("Resultados", F_SECCION, TEXTO), BorderLayout.NORTH);
        resultados.add(scroll, BorderLayout.CENTER);

        JPanel contenido = new JPanel(new BorderLayout(20, 0));
        contenido.setOpaque(false);
        contenido.add(crearPanelEntrada(), BorderLayout.WEST);
        contenido.add(resultados, BorderLayout.CENTER);

        principal.add(contenido, BorderLayout.CENTER);

        calcularFaltas();
        return principal;
    }

    private JPanel crearPanelEntrada() {
        Redondo panel = new Redondo(null, TARJETA, 30, BORDE);
        panel.setLayout(new BoxLayout(panel, BoxLayout.Y_AXIS));
        panel.setPreferredSize(new Dimension(500, 0));
        panel.setBorder(new EmptyBorder(22, 22, 22, 22));

        panel.add(izq(etiqueta("Introduce tus faltas", F_SECCION, TEXTO)));
        panel.add(Box.createVerticalStrut(4));
        panel.add(izq(etiqueta("Injustificadas y justificadas", F_SMALL, GRIS)));
        panel.add(Box.createVerticalStrut(18));

        // Cabecera de columnas
        JPanel cab = new JPanel(new BorderLayout(10, 0));
        cab.setOpaque(false);
        cab.setMaximumSize(new Dimension(Integer.MAX_VALUE, 24));
        JPanel colsCab = new JPanel(new GridLayout(1, 2, 8, 0));
        colsCab.setOpaque(false);
        colsCab.setPreferredSize(new Dimension(150, 20));
        JLabel inj = etiquetaCentrada("Injust.", F_SMALL, ROJO);
        inj.setToolTipText("Injustificadas");
        JLabel jus = etiquetaCentrada("Justif.", F_SMALL, VERDE);
        jus.setToolTipText("Justificadas");
        colsCab.add(inj);
        colsCab.add(jus);
        cab.add(etiqueta("Asignatura", F_SMALL, GRIS), BorderLayout.CENTER);
        cab.add(colsCab, BorderLayout.EAST);
        panel.add(izq(cab));
        panel.add(Box.createVerticalStrut(8));

        for (String nombre : limites.keySet()) {
            JPanel fila = new JPanel(new BorderLayout(10, 0));
            fila.setOpaque(false);
            fila.setMaximumSize(new Dimension(Integer.MAX_VALUE, 38));

            JPanel campos = new JPanel(new GridLayout(1, 2, 8, 0));
            campos.setOpaque(false);
            campos.setPreferredSize(new Dimension(150, 34));

            JTextField i = crearCampo();
            JTextField j = crearCampo();
            camposInjustificadas.put(nombre, i);
            camposJustificadas.put(nombre, j);
            campos.add(i);
            campos.add(j);

            fila.add(etiqueta(nombre, F_SMALL, TEXTO), BorderLayout.CENTER);
            fila.add(campos, BorderLayout.EAST);

            panel.add(izq(fila));
            panel.add(Box.createVerticalStrut(10));
        }

        panel.add(Box.createVerticalGlue());

        Boton boton = new Boton("CALCULAR FALTAS");
        boton.estilo(ROSA_FUERTE, Color.WHITE);
        boton.setMaximumSize(new Dimension(Integer.MAX_VALUE, 46));
        boton.addActionListener(e -> calcularFaltas());
        panel.add(Box.createVerticalStrut(10));
        panel.add(izq(boton));

        return panel;
    }

    private JTextField crearCampo() {
        JTextField campo = new JTextField("0");
        campo.setHorizontalAlignment(SwingConstants.CENTER);
        campo.setBackground(new Color(255, 247, 250));
        campo.setForeground(TEXTO);
        campo.setCaretColor(ROSA_FUERTE);
        campo.setFont(F_NORMAL);
        campo.setSelectionColor(BORDE);
        campo.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(BORDE),
                new EmptyBorder(5, 5, 5, 5)));
        return campo;
    }

    // =========================================================
    // CÁLCULO
    // =========================================================

    private void calcularFaltas() {
        try {
            Map<String, int[]> datos = new LinkedHashMap<>();
            int totalInj = 0;
            int totalJus = 0;

            for (String asignatura : limites.keySet()) {
                int inj = Integer.parseInt(camposInjustificadas.get(asignatura).getText().trim());
                int jus = Integer.parseInt(camposJustificadas.get(asignatura).getText().trim());
                if (inj < 0 || jus < 0) {
                    throw new NumberFormatException();
                }
                datos.put(asignatura, new int[] { inj, jus });
                totalInj += inj;
                totalJus += jus;
            }

            resultadosPanel.removeAll();
            resultadosPanel.add(crearResumen(totalInj, totalJus));
            resultadosPanel.add(Box.createVerticalStrut(14));

            for (Map.Entry<String, int[]> e : datos.entrySet()) {
                resultadosPanel.add(crearTarjetaFaltas(
                        e.getKey(), e.getValue()[0], e.getValue()[1], limites.get(e.getKey())));
                resultadosPanel.add(Box.createVerticalStrut(12));
            }

            resultadosPanel.revalidate();
            resultadosPanel.repaint();

        } catch (NumberFormatException e) {
            JOptionPane.showMessageDialog(this, "Introduce números válidos (enteros, sin negativos).",
                    "Error", JOptionPane.ERROR_MESSAGE);
        }
    }

    private JPanel crearResumen(int injustificadas, int justificadas) {
        Redondo tarjeta = new Redondo(new BorderLayout(10, 14), TARJETA, 28, BORDE);
        tarjeta.setBorder(new EmptyBorder(18, 18, 18, 18));
        tarjeta.add(etiqueta("RESUMEN GENERAL", F_BOLD, ROSA_FUERTE), BorderLayout.NORTH);

        JPanel datos = new JPanel(new GridLayout(1, 3, 12, 0));
        datos.setOpaque(false);

        // Para la matrícula solo cuentan las injustificadas
        int restantes = Math.max(0, LIMITE_MATRICULA - injustificadas);

        datos.add(crearDatoResumen("Injustificadas", injustificadas, ROJO));
        datos.add(crearDatoResumen("Justificadas", justificadas, VERDE));
        datos.add(crearDatoResumen("Para matrícula", restantes,
                obtenerColor(injustificadas, LIMITE_MATRICULA)));

        tarjeta.add(datos, BorderLayout.CENTER);
        return tarjeta;
    }

    private JPanel crearDatoResumen(String nombre, int valor, Color color) {
        Redondo panel = new Redondo(null, ROSA_SUAVE, 22);
        panel.setLayout(new BoxLayout(panel, BoxLayout.Y_AXIS));
        panel.setBorder(new EmptyBorder(12, 10, 12, 10));

        JLabel n = etiquetaCentrada(nombre, F_SMALL, GRIS);
        n.setAlignmentX(Component.CENTER_ALIGNMENT);

        JLabel v = etiquetaCentrada(String.valueOf(valor), new Font("Segoe UI", Font.BOLD, 26), color);
        v.setAlignmentX(Component.CENTER_ALIGNMENT);

        panel.add(n);
        panel.add(Box.createVerticalStrut(4));
        panel.add(v);
        return panel;
    }

    /**
     * Para la evaluación continua de cada asignatura cuentan las faltas
     * injustificadas Y las justificadas.
     */
    private JPanel crearTarjetaFaltas(String nombre, int injustificadas, int justificadas, int limite) {
        Redondo tarjeta = new Redondo(new BorderLayout(0, 12), TARJETA, 26, BORDE);
        tarjeta.setBorder(new EmptyBorder(16, 18, 16, 18));

        int total = injustificadas + justificadas;
        Color estado = obtenerColor(total, limite);

        // Cabecera: chip de color + nombre + contador
        JPanel arriba = new JPanel(new BorderLayout());
        arriba.setOpaque(false);

        JPanel izquierda = new JPanel(new FlowLayout(FlowLayout.LEFT, 8, 0));
        izquierda.setOpaque(false);
        Redondo chip = new Redondo(null, colorDe(nombre), 14, ROSA);
        chip.setPreferredSize(new Dimension(16, 16));
        izquierda.add(chip);
        izquierda.add(etiqueta(nombre, F_BOLD, TEXTO));

        arriba.add(izquierda, BorderLayout.WEST);
        JLabel contador = etiqueta(total + " / " + limite, F_BOLD, estado);
        contador.setToolTipText("Injustificadas + justificadas");
        arriba.add(contador, BorderLayout.EAST);

        tarjeta.add(arriba, BorderLayout.NORTH);
        tarjeta.add(new Barra(Math.min(total, limite), limite, estado), BorderLayout.CENTER);

        // Pie: mensaje + desglose
        JPanel pie = new JPanel(new BorderLayout());
        pie.setOpaque(false);

        JLabel mensaje;
        if (total >= limite) {
            mensaje = etiqueta("✕ Has perdido la evaluación continua", F_SMALL, ROJO);
        } else {
            mensaje = etiqueta("✓ Te quedan " + (limite - total) + " faltas (justificadas + injustificadas)",
                    F_SMALL, estado);
        }

        pie.add(mensaje, BorderLayout.WEST);
        pie.add(etiqueta("Injust.: " + injustificadas + "  ·  Justif.: " + justificadas, F_SMALL, GRIS),
                BorderLayout.EAST);

        tarjeta.add(pie, BorderLayout.SOUTH);
        return tarjeta;
    }

    private Color obtenerColor(int faltas, int limite) {
        double p = (double) faltas / limite;
        if (p >= 1)
            return ROJO;
        if (p >= 0.75)
            return AMARILLO;
        return VERDE;
    }

    // =========================================================
    // PANEL HORARIO (DÍA)
    // =========================================================

    private JPanel crearPanelHorario() {
        JPanel principal = new JPanel(new BorderLayout(20, 20));
        principal.setOpaque(false);
        principal.setBorder(new EmptyBorder(20, 30, 25, 30));

        principal.add(crearCabecera("Horario", "Horario de clase del día seleccionado"),
                BorderLayout.NORTH);

        // Selector de fecha
        Boton anterior = new Boton("← Anterior");
        Boton hoy = new Boton("Hoy");
        hoy.estilo(ROSA, Color.WHITE);
        Boton siguiente = new Boton("Siguiente →");

        anterior.addActionListener(e -> {
            fechaHorario = fechaHorario.minusDays(1);
            actualizarTablaHorario();
        });
        hoy.addActionListener(e -> {
            fechaHorario = LocalDate.now();
            actualizarTablaHorario();
        });
        siguiente.addActionListener(e -> {
            fechaHorario = fechaHorario.plusDays(1);
            actualizarTablaHorario();
        });

        fechaHorarioLabel = etiquetaCentrada("", new Font("Segoe UI", Font.BOLD, 20), TEXTO);

        JPanel derecha = new JPanel(new FlowLayout(FlowLayout.RIGHT, 8, 0));
        derecha.setOpaque(false);
        derecha.add(hoy);
        derecha.add(siguiente);

        JPanel selector = new JPanel(new BorderLayout(10, 0));
        selector.setOpaque(false);
        selector.add(anterior, BorderLayout.WEST);
        selector.add(fechaHorarioLabel, BorderLayout.CENTER);
        selector.add(derecha, BorderLayout.EAST);

        tablaHorarioPanel = new JPanel(new BorderLayout());
        tablaHorarioPanel.setOpaque(false);

        JPanel centro = new JPanel(new BorderLayout(0, 15));
        centro.setOpaque(false);
        centro.add(selector, BorderLayout.NORTH);
        centro.add(tablaHorarioPanel, BorderLayout.CENTER);
        centro.add(crearPanelProximosDiasSinClase(), BorderLayout.SOUTH);

        principal.add(centro, BorderLayout.CENTER);

        actualizarTablaHorario();
        return principal;
    }

    private void actualizarTablaHorario() {
        fechaHorarioLabel.setText(capitalizar(fechaHorario.format(FORMATO_FECHA)));
        tablaHorarioPanel.removeAll();

        String motivo = obtenerMotivoSinClase(fechaHorario);

        if (motivo != null) {
            Redondo sinClase = new Redondo(null, TARJETA, 30, BORDE);
            sinClase.setLayout(new BoxLayout(sinClase, BoxLayout.Y_AXIS));

            JLabel flor = etiquetaCentrada("🌸", new Font("Segoe UI", Font.PLAIN, 44), ROSA);
            JLabel titulo = etiquetaCentrada("NO HAY CLASE", new Font("Segoe UI", Font.BOLD, 30), ROSA_FUERTE);
            JLabel m = etiquetaCentrada(motivo, F_NORMAL, GRIS);
            for (JLabel l : new JLabel[] { flor, titulo, m }) {
                l.setAlignmentX(Component.CENTER_ALIGNMENT);
            }

            sinClase.add(Box.createVerticalGlue());
            sinClase.add(flor);
            sinClase.add(Box.createVerticalStrut(8));
            sinClase.add(titulo);
            sinClase.add(Box.createVerticalStrut(8));
            sinClase.add(m);
            sinClase.add(Box.createVerticalGlue());

            tablaHorarioPanel.add(sinClase, BorderLayout.CENTER);
        } else {
            String[][] clases = horario.get(fechaHorario.getDayOfWeek());
            if (clases == null) {
                tablaHorarioPanel.add(etiquetaCentrada("No hay clases programadas", F_BOLD, GRIS),
                        BorderLayout.CENTER);
            } else {
                tablaHorarioPanel.add(crearTablaHorario(clases), BorderLayout.CENTER);
            }
        }

        tablaHorarioPanel.revalidate();
        tablaHorarioPanel.repaint();
    }

    private JPanel crearTablaHorario(String[][] clases) {
        JPanel tabla = new JPanel(new GridBagLayout());
        tabla.setOpaque(false);

        int fila = 0;
        for (int i = 0; i < TRAMOS.length; i++) {
            if (i == 2 || i == 4) {
                addGrid(tabla, crearFilaRecreo(RECREOS[i / 2 - 1]), 0, fila++, 1, 1, 1.0, 0.35);
            }
            addGrid(tabla, crearFilaClase(TRAMOS[i], clases[i]), 0, fila++, 1, 1, 1.0, 1.0);
        }
        return tabla;
    }

    private JPanel crearFilaClase(String hora, String[] clase) {
        Redondo fila = new Redondo(new BorderLayout(18, 0), colorDe(clase[0]), 24, BORDE);
        fila.setBorder(new EmptyBorder(8, 20, 8, 20));

        JLabel horaLabel = etiqueta(hora, F_BOLD, ROSA_FUERTE);
        horaLabel.setPreferredSize(new Dimension(120, 20));

        JPanel textos = new JPanel();
        textos.setLayout(new BoxLayout(textos, BoxLayout.Y_AXIS));
        textos.setOpaque(false);
        textos.add(Box.createVerticalGlue());
        textos.add(etiqueta(clase[0], new Font("Segoe UI", Font.BOLD, 17), TEXTO));
        textos.add(Box.createVerticalStrut(2));
        textos.add(etiqueta(clase[1], F_SMALL, mezclar(TEXTO, Color.WHITE, 0.25f)));
        textos.add(Box.createVerticalGlue());

        Redondo chipAula = new Redondo(new BorderLayout(), TARJETA, 18, BORDE);
        chipAula.setBorder(new EmptyBorder(5, 14, 5, 14));
        chipAula.add(etiqueta(AULA, F_SMALL, ROSA_FUERTE), BorderLayout.CENTER);

        JPanel derecha = new JPanel(new GridBagLayout());
        derecha.setOpaque(false);
        derecha.add(chipAula);

        fila.add(horaLabel, BorderLayout.WEST);
        fila.add(textos, BorderLayout.CENTER);
        fila.add(derecha, BorderLayout.EAST);
        return fila;
    }

    private JPanel crearFilaRecreo(String hora) {
        Redondo fila = new Redondo(new BorderLayout(), CREMA, 20);
        fila.add(etiquetaCentrada("☕  Recreo · " + hora, F_SMALL, new Color(170, 115, 35)),
                BorderLayout.CENTER);
        return fila;
    }

    // =========================================================
    // PRÓXIMOS DÍAS SIN CLASE
    // =========================================================

    private JPanel crearPanelProximosDiasSinClase() {
        Redondo panel = new Redondo(null, TARJETA, 26, BORDE);
        panel.setLayout(new BoxLayout(panel, BoxLayout.Y_AXIS));
        panel.setBorder(new EmptyBorder(15, 20, 15, 20));

        panel.add(izq(etiqueta("🌷 Próximos días sin clase", F_BOLD, ROSA_FUERTE)));
        panel.add(Box.createVerticalStrut(10));

        LocalDate hoy = LocalDate.now();
        int encontrados = 0;

        for (Periodo p : periodos) {
            if (p.fin.isBefore(hoy))
                continue;
            if (encontrados >= 4)
                break;

            String fecha = p.inicio.equals(p.fin)
                    ? p.inicio.format(FORMATO_CORTO)
                    : p.inicio.format(FORMATO_CORTO) + " – " + p.fin.format(FORMATO_CORTO);

            panel.add(izq(etiqueta("•  " + fecha + "  —  " + p.motivo, F_SMALL, GRIS)));
            panel.add(Box.createVerticalStrut(5));
            encontrados++;
        }

        if (encontrados == 0) {
            panel.add(izq(etiqueta("No hay próximos días sin clase registrados.", F_SMALL, GRIS)));
        }
        return panel;
    }

    private String obtenerMotivoSinClase(LocalDate fecha) {
        if (fecha.getDayOfWeek() == DayOfWeek.SATURDAY || fecha.getDayOfWeek() == DayOfWeek.SUNDAY) {
            return "Fin de semana";
        }
        return diasSinClase.get(fecha);
    }

    // =========================================================
    // PANEL SEMANA (VISTA COMPLETA)
    // =========================================================

    private JPanel crearPanelSemana() {
        JPanel principal = new JPanel(new BorderLayout(20, 20));
        principal.setOpaque(false);
        principal.setBorder(new EmptyBorder(20, 30, 25, 30));

        principal.add(crearCabecera("Horario semanal", "DAM 1 · Toda la semana de un vistazo"),
                BorderLayout.NORTH);

        Redondo tarjeta = new Redondo(new BorderLayout(), TARJETA, 30, BORDE);
        tarjeta.setBorder(new EmptyBorder(14, 14, 14, 14));

        JPanel grid = new JPanel(new GridBagLayout());
        grid.setOpaque(false);

        DayOfWeek[] dias = { DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY,
                DayOfWeek.THURSDAY, DayOfWeek.FRIDAY };
        String[] nombres = { "Lunes", "Martes", "Miércoles", "Jueves", "Viernes" };
        DayOfWeek hoy = LocalDate.now().getDayOfWeek();

        // Cabecera
        addGrid(grid, new JPanel() {
            {
                setOpaque(false);
            }
        }, 0, 0, 1, 1, 0.4, 0);
        for (int d = 0; d < 5; d++) {
            boolean esHoy = dias[d] == hoy;
            Redondo cab = new Redondo(new BorderLayout(), esHoy ? ROSA : ROSA_SUAVE, 18);
            cab.setBorder(new EmptyBorder(8, 4, 8, 4));
            cab.add(etiquetaCentrada(nombres[d], F_BOLD, esHoy ? Color.WHITE : ROSA_FUERTE),
                    BorderLayout.CENTER);
            addGrid(grid, cab, d + 1, 0, 1, 1, 1.0, 0);
        }

        // Horas y recreos
        for (int i = 0; i < TRAMOS.length; i++) {
            String[] h = TRAMOS[i].split("–");
            Redondo hora = new Redondo(new BorderLayout(), ROSA_SUAVE, 16);
            hora.add(etiquetaCentrada("<html><div align='center'>" + h[0] + "<br>" + h[1] + "</div></html>",
                    F_SMALL, ROSA_FUERTE), BorderLayout.CENTER);
            addGrid(grid, hora, 0, filaGrid(i), 1, 1, 0.4, 1.0);

            if (i == 1 || i == 3) {
                Redondo rec = new Redondo(new BorderLayout(), CREMA, 14);
                rec.add(etiquetaCentrada("☕  Recreo · " + RECREOS[i / 2], F_SMALL, new Color(170, 115, 35)),
                        BorderLayout.CENTER);
                addGrid(grid, rec, 1, filaGrid(i) + 1, 5, 1, 1.0, 0.25);
            }
        }

        // Clases (se fusionan las parejas de tramos iguales)
        for (int d = 0; d < 5; d++) {
            String[][] clases = horario.get(dias[d]);
            for (int i = 0; i < TRAMOS.length; i++) {
                if (i % 2 == 1 && clases[i - 1][0].equals(clases[i][0]))
                    continue;
                boolean fusion = i % 2 == 0 && clases[i][0].equals(clases[i + 1][0]);
                addGrid(grid, crearCeldaSemana(clases[i]), d + 1, filaGrid(i), 1, fusion ? 2 : 1, 1.0, 0);
            }
        }

        tarjeta.add(grid, BorderLayout.CENTER);
        principal.add(tarjeta, BorderLayout.CENTER);
        return principal;
    }

    /** Fila del GridBag para cada tramo (hay una fila extra por cada recreo). */
    private static int filaGrid(int tramo) {
        return 1 + tramo + (tramo >= 2 ? 1 : 0) + (tramo >= 4 ? 1 : 0);
    }

    private JPanel crearCeldaSemana(String[] clase) {
        Redondo celda = new Redondo(new BorderLayout(), colorDe(clase[0]), 18, BORDE);
        celda.setBorder(new EmptyBorder(6, 8, 6, 8));
        String corto = CORTOS.getOrDefault(clase[0], clase[0]);
        JLabel l = etiquetaCentrada("<html><div align='center'><b>" + corto + "</b><br>"
                + "<span style='font-size:10px'>" + clase[1] + "</span></div></html>", F_SMALL, TEXTO);
        celda.add(l, BorderLayout.CENTER);
        celda.setToolTipText(clase[0] + " · " + clase[1] + " · " + AULA);
        return celda;
    }

    // =========================================================
    // PANEL CHAT (SIMULADO — NO HAY CONEXIÓN REAL ENTRE USUARIOS)
    // =========================================================

    private JPanel crearPanelChat() {
        JPanel principal = new JPanel(new BorderLayout(20, 20));
        principal.setOpaque(false);
        principal.setBorder(new EmptyBorder(20, 30, 25, 30));

        principal.add(crearCabecera("Chat",
                "Modo demostración · los compañeros y sus respuestas son simulados"), BorderLayout.NORTH);

        // ---------- Columna izquierda: conversaciones y gestión ----------
        Redondo izquierda = new Redondo(new BorderLayout(0, 12), TARJETA, 30, BORDE);
        izquierda.setPreferredSize(new Dimension(340, 0));
        izquierda.setBorder(new EmptyBorder(18, 16, 16, 16));

        izquierda.add(etiqueta("Conversaciones", F_SECCION, TEXTO), BorderLayout.NORTH);

        listaChats = new JList<>(modeloChats);
        listaChats.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
        listaChats.setOpaque(false);
        listaChats.setFixedCellHeight(56);
        listaChats.setCellRenderer((list, c, idx, sel, foc) -> {
            String ultimo = c.mensajes.isEmpty() ? "Sin mensajes"
                    : c.mensajes.get(c.mensajes.size() - 1).texto;
            if (ultimo.length() > 32) {
                ultimo = ultimo.substring(0, 32) + "…";
            }
            JLabel l = new JLabel("<html><b>" + (c.grupo ? "👥 " : "👤 ") + esc(c.nombre) + "</b><br>"
                    + "<span style='color:#a07d8e'>" + esc(ultimo) + "</span></html>");
            l.setOpaque(true);
            l.setFont(F_SMALL);
            l.setForeground(TEXTO);
            l.setBackground(sel ? ROSA_SUAVE : TARJETA);
            l.setBorder(new EmptyBorder(6, 10, 6, 10));
            return l;
        });
        listaChats.addListSelectionListener(e -> {
            if (!e.getValueIsAdjusting()) {
                mostrarConversacion();
            }
        });

        JScrollPane scrollLista = new JScrollPane(listaChats);
        scrollLista.setBorder(null);
        scrollLista.getViewport().setOpaque(false);
        scrollLista.setOpaque(false);
        scrollLista.getVerticalScrollBar().setPreferredSize(new Dimension(8, 0));
        izquierda.add(scrollLista, BorderLayout.CENTER);

        JPanel botonesGestion = new JPanel(new GridLayout(3, 2, 6, 6));
        botonesGestion.setOpaque(false);
        Boton bAnadir = new Boton("＋ Amigo");
        Boton bQuitar = new Boton("－ Amigo");
        Boton bGrupo = new Boton("＋ Grupo");
        Boton bEditar = new Boton("✎ Grupo");
        Boton bBorrar = new Boton("🗑 Chat");
        bAnadir.addActionListener(e -> anadirAmigo());
        bQuitar.addActionListener(e -> borrarAmigo());
        bGrupo.addActionListener(e -> crearGrupo());
        bEditar.addActionListener(e -> editarGrupo());
        bBorrar.addActionListener(e -> borrarConversacion());
        for (Boton b : new Boton[] { bAnadir, bQuitar, bGrupo, bEditar, bBorrar }) {
            b.setFont(F_SMALL);
            b.setBorder(new EmptyBorder(8, 8, 8, 8));
            botonesGestion.add(b);
        }
        izquierda.add(botonesGestion, BorderLayout.SOUTH);

        // ---------- Columna derecha: mensajes ----------
        Redondo derecha = new Redondo(new BorderLayout(0, 10), TARJETA, 30, BORDE);
        derecha.setBorder(new EmptyBorder(18, 20, 16, 20));

        JPanel cabChat = new JPanel();
        cabChat.setLayout(new BoxLayout(cabChat, BoxLayout.Y_AXIS));
        cabChat.setOpaque(false);
        chatTitulo = izq(etiqueta(" ", F_SECCION, TEXTO));
        chatSubtitulo = izq(etiqueta(" ", F_SMALL, GRIS));
        cabChat.add(chatTitulo);
        cabChat.add(Box.createVerticalStrut(2));
        cabChat.add(chatSubtitulo);
        derecha.add(cabChat, BorderLayout.NORTH);

        mensajesPanel = new JPanel();
        mensajesPanel.setLayout(new BoxLayout(mensajesPanel, BoxLayout.Y_AXIS));
        mensajesPanel.setOpaque(false);

        JPanel envoltorio = new JPanel(new BorderLayout());
        envoltorio.setOpaque(false);
        envoltorio.add(mensajesPanel, BorderLayout.NORTH);

        mensajesScroll = new JScrollPane(envoltorio);
        mensajesScroll.setBorder(null);
        mensajesScroll.getViewport().setBackground(TARJETA);
        mensajesScroll.getVerticalScrollBar().setUnitIncrement(16);
        mensajesScroll.getVerticalScrollBar().setPreferredSize(new Dimension(8, 0));
        derecha.add(mensajesScroll, BorderLayout.CENTER);

        JPanel entrada = new JPanel(new BorderLayout(10, 0));
        entrada.setOpaque(false);
        campoMensaje = crearCampo();
        campoMensaje.setText("");
        campoMensaje.setHorizontalAlignment(SwingConstants.LEFT);
        campoMensaje.addActionListener(e -> enviarMensaje());
        Boton enviar = new Boton("Enviar");
        enviar.estilo(ROSA_FUERTE, Color.WHITE);
        enviar.addActionListener(e -> enviarMensaje());
        entrada.add(campoMensaje, BorderLayout.CENTER);
        entrada.add(enviar, BorderLayout.EAST);
        derecha.add(entrada, BorderLayout.SOUTH);

        JPanel contenido = new JPanel(new BorderLayout(20, 0));
        contenido.setOpaque(false);
        contenido.add(izquierda, BorderLayout.WEST);
        contenido.add(derecha, BorderLayout.CENTER);
        principal.add(contenido, BorderLayout.CENTER);

        if (!modeloChats.isEmpty()) {
            listaChats.setSelectedIndex(0);
        }
        mostrarConversacion();
        return principal;
    }

    private void mostrarConversacion() {
        Conversacion c = listaChats.getSelectedValue();
        mensajesPanel.removeAll();

        if (c == null) {
            chatTitulo.setText("Selecciona una conversación");
            chatSubtitulo.setText("O añade un amigo / crea un grupo con los botones de la izquierda");
        } else {
            chatTitulo.setText((c.grupo ? "👥 " : "👤 ") + c.nombre);
            chatSubtitulo.setText(c.grupo
                    ? "Miembros: " + (c.miembros.isEmpty() ? "nadie" : String.join(", ", c.miembros)) + " y tú"
                    : "Chat privado");
            for (Mensaje m : c.mensajes) {
                mensajesPanel.add(crearBurbuja(m, c.grupo));
                mensajesPanel.add(Box.createVerticalStrut(8));
            }
        }

        mensajesPanel.revalidate();
        mensajesPanel.repaint();
        bajarScroll();
    }

    private void bajarScroll() {
        SwingUtilities.invokeLater(() -> {
            JScrollBar sb = mensajesScroll.getVerticalScrollBar();
            sb.setValue(sb.getMaximum());
        });
    }

    private JPanel crearBurbuja(Mensaje m, boolean grupo) {
        boolean mio = m.autor.equals(YO);

        Redondo burbuja = new Redondo(new BorderLayout(0, 2), mio ? ROSA : ROSA_SUAVE, 22);
        burbuja.setBorder(new EmptyBorder(8, 14, 8, 14));

        if (!mio && grupo) {
            burbuja.add(etiqueta(m.autor, new Font("Segoe UI", Font.BOLD, 12), ROSA_FUERTE), BorderLayout.NORTH);
        }

        String texto = m.texto;
        int ancho = new JLabel().getFontMetrics(F_NORMAL).stringWidth(texto);
        JLabel contenido = new JLabel(ancho > 380
                ? "<html><div style='width:380px'>" + esc(texto) + "</div></html>"
                : texto);
        contenido.setFont(F_NORMAL);
        contenido.setForeground(mio ? Color.WHITE : TEXTO);
        burbuja.add(contenido, BorderLayout.CENTER);

        JLabel hora = etiqueta(m.hora.format(FORMATO_HORA), new Font("Segoe UI", Font.PLAIN, 11),
                mio ? new Color(255, 235, 243) : GRIS);
        hora.setHorizontalAlignment(SwingConstants.RIGHT);
        burbuja.add(hora, BorderLayout.SOUTH);

        JPanel fila = new JPanel(new BorderLayout());
        fila.setOpaque(false);
        fila.add(burbuja, mio ? BorderLayout.EAST : BorderLayout.WEST);
        return fila;
    }

    private void enviarMensaje() {
        Conversacion c = listaChats.getSelectedValue();
        String texto = campoMensaje.getText().trim();
        if (c == null || texto.isEmpty()) {
            return;
        }

        c.mensajes.add(new Mensaje(YO, texto));
        campoMensaje.setText("");
        mostrarConversacion();
        listaChats.repaint();

        // Respuesta automática simulada (no hay usuarios reales)
        if (!c.miembros.isEmpty()) {
            Timer t = new Timer(900 + random.nextInt(1300), ev -> {
                if (c.miembros.isEmpty() || !modeloChats.contains(c)) {
                    return;
                }
                String autor = c.miembros.get(random.nextInt(c.miembros.size()));
                c.mensajes.add(new Mensaje(autor, RESPUESTAS[random.nextInt(RESPUESTAS.length)]));
                if (listaChats.getSelectedValue() == c) {
                    mostrarConversacion();
                }
                listaChats.repaint();
            });
            t.setRepeats(false);
            t.start();
        }
    }

    // ---------- Gestión de amigos y grupos ----------

    private void seleccionar(Conversacion c) {
        listaChats.setSelectedValue(c, true);
    }

    private void anadirAmigo() {
        String nombre = JOptionPane.showInputDialog(this, "Nombre del compañero:", "Añadir amigo",
                JOptionPane.PLAIN_MESSAGE);
        if (nombre == null) {
            return;
        }
        nombre = nombre.trim();
        if (nombre.isEmpty()) {
            return;
        }
        for (String a : amigos) {
            if (a.equalsIgnoreCase(nombre)) {
                JOptionPane.showMessageDialog(this, nombre + " ya está en tu lista de amigos.",
                        "Amigo repetido", JOptionPane.INFORMATION_MESSAGE);
                return;
            }
        }

        amigos.add(nombre);
        Conversacion c = new Conversacion(nombre, false);
        c.miembros.add(nombre);
        c.mensajes.add(new Mensaje(nombre, "¡Hola! Ya somos amigos 🌸"));
        modeloChats.addElement(c);
        seleccionar(c);
    }

    private void borrarAmigo() {
        if (amigos.isEmpty()) {
            JOptionPane.showMessageDialog(this, "No tienes amigos que eliminar.", "Lista vacía",
                    JOptionPane.INFORMATION_MESSAGE);
            return;
        }
        Object elegido = JOptionPane.showInputDialog(this, "¿A quién quieres eliminar?", "Eliminar amigo",
                JOptionPane.QUESTION_MESSAGE, null, amigos.toArray(), amigos.get(0));
        if (elegido == null) {
            return;
        }
        String nombre = (String) elegido;
        int ok = JOptionPane.showConfirmDialog(this,
                "Se eliminará a " + nombre + " de tus amigos, de su chat y de tus grupos.",
                "Confirmar", JOptionPane.OK_CANCEL_OPTION, JOptionPane.WARNING_MESSAGE);
        if (ok != JOptionPane.OK_OPTION) {
            return;
        }

        amigos.remove(nombre);
        for (int i = modeloChats.size() - 1; i >= 0; i--) {
            Conversacion c = modeloChats.get(i);
            if (c.grupo) {
                c.miembros.remove(nombre);
            } else if (c.nombre.equals(nombre)) {
                modeloChats.remove(i);
            }
        }
        mostrarConversacion();
        listaChats.repaint();
    }

    private ResultadoGrupo dialogoGrupo(String titulo, String nombreInicial, List<String> seleccionados) {
        JPanel p = new JPanel();
        p.setLayout(new BoxLayout(p, BoxLayout.Y_AXIS));

        JTextField nombre = new JTextField(nombreInicial, 20);
        p.add(izq(new JLabel("Nombre del grupo:")));
        p.add(izq(nombre));
        p.add(Box.createVerticalStrut(10));
        p.add(izq(new JLabel("Miembros:")));

        List<JCheckBox> checks = new ArrayList<>();
        for (String a : amigos) {
            JCheckBox cb = new JCheckBox(a, seleccionados.contains(a));
            checks.add(cb);
            p.add(izq(cb));
        }

        int r = JOptionPane.showConfirmDialog(this, p, titulo, JOptionPane.OK_CANCEL_OPTION,
                JOptionPane.PLAIN_MESSAGE);
        if (r != JOptionPane.OK_OPTION) {
            return null;
        }

        List<String> miembros = new ArrayList<>();
        for (JCheckBox cb : checks) {
            if (cb.isSelected()) {
                miembros.add(cb.getText());
            }
        }
        return new ResultadoGrupo(nombre.getText().trim(), miembros);
    }

    private void crearGrupo() {
        if (amigos.isEmpty()) {
            JOptionPane.showMessageDialog(this, "Primero añade algún amigo para poder crear un grupo.",
                    "Sin amigos", JOptionPane.INFORMATION_MESSAGE);
            return;
        }
        ResultadoGrupo res = dialogoGrupo("Nuevo grupo", "", new ArrayList<>());
        if (res == null) {
            return;
        }
        if (res.nombre.isEmpty() || res.miembros.isEmpty()) {
            JOptionPane.showMessageDialog(this, "El grupo necesita un nombre y al menos un miembro.",
                    "Datos incompletos", JOptionPane.WARNING_MESSAGE);
            return;
        }

        Conversacion g = new Conversacion(res.nombre, true);
        g.miembros.addAll(res.miembros);
        g.mensajes.add(new Mensaje(YO, "¡He creado el grupo! 🌸"));
        modeloChats.add(0, g);
        seleccionar(g);
    }

    private void editarGrupo() {
        Conversacion c = listaChats.getSelectedValue();
        if (c == null || !c.grupo) {
            JOptionPane.showMessageDialog(this, "Selecciona primero un grupo de la lista.",
                    "Ningún grupo seleccionado", JOptionPane.INFORMATION_MESSAGE);
            return;
        }
        ResultadoGrupo res = dialogoGrupo("Editar grupo", c.nombre, c.miembros);
        if (res == null) {
            return;
        }
        if (res.nombre.isEmpty()) {
            JOptionPane.showMessageDialog(this, "El grupo necesita un nombre.",
                    "Datos incompletos", JOptionPane.WARNING_MESSAGE);
            return;
        }

        c.nombre = res.nombre;
        c.miembros.clear();
        c.miembros.addAll(res.miembros);
        mostrarConversacion();
        listaChats.repaint();
    }

    private void borrarConversacion() {
        Conversacion c = listaChats.getSelectedValue();
        if (c == null) {
            JOptionPane.showMessageDialog(this, "Selecciona una conversación de la lista.",
                    "Nada seleccionado", JOptionPane.INFORMATION_MESSAGE);
            return;
        }
        int ok = JOptionPane.showConfirmDialog(this,
                "¿Borrar " + (c.grupo ? "el grupo " : "el chat con ") + c.nombre + "?"
                        + (c.grupo ? "" : "\n(Seguirá en tu lista de amigos.)"),
                "Confirmar", JOptionPane.OK_CANCEL_OPTION, JOptionPane.WARNING_MESSAGE);
        if (ok == JOptionPane.OK_OPTION) {
            modeloChats.removeElement(c);
            mostrarConversacion();
        }
    }

    // =========================================================
    // MAIN
    // =========================================================

    public static void main(String[] args) {
        SwingUtilities.invokeLater(ClassEssentials::new);
    }
}