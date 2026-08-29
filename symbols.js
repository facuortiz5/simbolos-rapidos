const SYMBOLS = [

  // =========================
  // LETRAS ESPECIALES
  // =========================

  { symbol: "ñ", name: "Eñe", keywords: ["enie", "ene con tilde", "n con tilde"] },
  { symbol: "Ñ", name: "Eñe mayúscula", keywords: ["enie mayuscula", "ene con tilde mayuscula", "n con tilde mayuscula"] },


  // =========================
  // BARRAS, LLAVES Y CORCHETES
  // =========================

  { symbol: "/", name: "Barra", keywords: ["slash", "barra", "barra diagonal"] },
  { symbol: "\\", name: "Barra invertida", keywords: ["backslash", "barra invertida", "contrabarra"] },
  { symbol: "|", name: "Barra vertical", keywords: ["barra vertical", "pipe", "vertical bar"] },
  { symbol: "{", name: "Llave de apertura", keywords: ["llave", "llave apertura", "llave izquierda", "curly bracket", "opening brace"] },
  { symbol: "}", name: "Llave de cierre", keywords: ["llave", "llave cierre", "llave derecha", "curly bracket", "closing brace"] },
  { symbol: "[", name: "Corchete de apertura", keywords: ["corchete", "corchete apertura", "corchete izquierdo", "square bracket", "opening bracket"] },
  { symbol: "]", name: "Corchete de cierre", keywords: ["corchete", "corchete cierre", "corchete derecho", "square bracket", "closing bracket"] },
  { symbol: "_", name: "Guion bajo", keywords: ["guion bajo", "underscore", "barra baja"] },


  // =========================
  // SÍMBOLOS GENERALES
  // =========================

  { symbol: "~", name: "Virgulilla", keywords: ["virgulilla", "tilde", "tilde symbol", "aproximacion", "aproximación"] },
  { symbol: "©", name: "Copyright", keywords: ["copyright", "copy right", "derechos de autor"] },
  { symbol: "°", name: "Grados", keywords: ["grado", "grados", "temperatura"] },
  { symbol: "™", name: "Marca comercial", keywords: ["trademark", "trade mark", "marca comercial"] },
  { symbol: "®", name: "Marca registrada", keywords: ["registrado", "registered", "marca registrada"] },
  { symbol: "^", name: "Circunflejo", keywords: ["circunflejo", "caret", "sombrerito", "caret symbol", "sombrero"] },


  // =========================
  // FLECHAS
  // =========================

  { symbol: "→", name: "Flecha derecha", keywords: ["flecha derecha", "derecha", "arrow right"] },
  { symbol: "←", name: "Flecha izquierda", keywords: ["flecha izquierda", "izquierda", "arrow left"] },


  // =========================
  // MONEDAS
  // =========================

  { symbol: "€", name: "Euro", keywords: ["euro", "euros", "moneda europea"] },
  { symbol: "$", name: "Dólar", keywords: ["usd", "dollar", "dollars", "dolar", "dólar", "dolares", "dólares"] },
  { symbol: "£", name: "Libra", keywords: ["libra", "libras", "pound", "moneda inglesa"] },
  { symbol: "¥", name: "Yen", keywords: ["yen", "yuan", "moneda japonesa"] },
  { symbol: "¢", name: "Centavo", keywords: ["centavo", "cent", "cents"] },


  // =========================
  // MATEMÁTICA
  // =========================

  { symbol: "<", name: "Menor que", keywords: ["menor", "menor que", "less than", "less than sign"] },
  { symbol: ">", name: "Mayor que", keywords: ["mayor", "mayor que", "greater than", "greater than sign"] },
  { symbol: "≤", name: "Menor o igual", keywords: ["menor o igual", "menor igual", "less than"] },
  { symbol: "≥", name: "Mayor o igual", keywords: ["mayor o igual", "mayor igual", "greater than"] },
  { symbol: "≠", name: "Distinto de", keywords: ["igual tachado", "distinto", "no igual", "diferente"] },
  { symbol: "∞", name: "Infinito", keywords: ["infinito", "infinity"] },
  { symbol: "≈", name: "Aproximadamente", keywords: ["aproximadamente", "aproximado", "casi igual"] },
  { symbol: "±", name: "Más o menos", keywords: ["mas o menos", "más o menos", "plus minus"] },
  { symbol: "÷", name: "División", keywords: ["division", "división", "dividido", "obelus"] },
  { symbol: "√", name: "Raíz cuadrada", keywords: ["raiz", "raíz", "raiz cuadrada", "square root"] },

  // =========================
  // PUNTUACIÓN Y ESCRITURA
  // =========================

  { symbol: "¿", name: "Interrogación de apertura", keywords: ["interrogacion", "interrogación", "pregunta apertura", "signo de interrogación de apertura", "signo de interrogacion de apertura"] },
  { symbol: "¡", name: "Exclamación de apertura", keywords: ["exclamacion", "exclamación", "admiracion", "admiración", "signo de exclamación de apertura", "signo de exclamacion de apertura"] },
  { symbol: "«", name: "Comillas angulares de apertura", keywords: ["comillas", "comillas francesas", "comillas apertura"] },
  { symbol: "»", name: "Comillas angulares de cierre", keywords: ["comillas", "comillas francesas", "comillas cierre"] },
  { symbol: "#", name: "Hashtag", keywords: ["hashtag", "hash", "numeral", "number sign", "gato"] },
  { symbol: "@", name: "Arroba", keywords: ["arroba", "at", "at sign", "email", "correo"] },
  { symbol: "•", name: "Viñeta", keywords: ["viñeta", "vineta", "bullet", "punto de lista", "punto negro"] },


  // =========================
  // ACENTO AGUDO
  // =========================

  { symbol: "á", name: "A con acento agudo", keywords: ["a con tilde", "a con acento", "a aguda", "a acute", "acute a"] },
  { symbol: "é", name: "E con acento agudo", keywords: ["e con tilde", "e con acento", "e aguda", "e acute", "acute e"] },
  { symbol: "í", name: "I con acento agudo", keywords: ["i con tilde", "i con acento", "i aguda", "i acute", "acute i"] },
  { symbol: "ó", name: "O con acento agudo", keywords: ["o con tilde", "o con acento", "o aguda", "o acute", "acute o"] },
  { symbol: "ú", name: "U con acento agudo", keywords: ["u con tilde", "u con acento", "u aguda", "u acute", "acute u"] },

  { symbol: "Á", name: "A mayúscula con acento agudo", keywords: ["a mayuscula con tilde", "a mayúscula con tilde", "a mayuscula aguda", "uppercase a acute", "capital a acute"] },
  { symbol: "É", name: "E mayúscula con acento agudo", keywords: ["e mayuscula con tilde", "e mayúscula con tilde", "e mayuscula aguda", "uppercase e acute", "capital e acute"] },
  { symbol: "Í", name: "I mayúscula con acento agudo", keywords: ["i mayuscula con tilde", "i mayúscula con tilde", "i mayuscula aguda", "uppercase i acute", "capital i acute"] },
  { symbol: "Ó", name: "O mayúscula con acento agudo", keywords: ["o mayuscula con tilde", "o mayúscula con tilde", "o mayuscula aguda", "uppercase o acute", "capital o acute"] },
  { symbol: "Ú", name: "U mayúscula con acento agudo", keywords: ["u mayuscula con tilde", "u mayúscula con tilde", "u mayuscula aguda", "uppercase u acute", "capital u acute"] },


  // =========================
  // ACENTO GRAVE
  // =========================

  { symbol: "à", name: "A con acento grave", keywords: ["a grave", "a con acento grave", "grave a"] },
  { symbol: "è", name: "E con acento grave", keywords: ["e grave", "e con acento grave", "grave e"] },
  { symbol: "ì", name: "I con acento grave", keywords: ["i grave", "i con acento grave", "grave i"] },
  { symbol: "ò", name: "O con acento grave", keywords: ["o grave", "o con acento grave", "grave o"] },
  { symbol: "ù", name: "U con acento grave", keywords: ["u grave", "u con acento grave", "grave u"] },

  { symbol: "À", name: "A mayúscula con acento grave", keywords: ["a mayuscula grave", "a mayúscula grave", "uppercase a grave", "capital a grave"] },
  { symbol: "È", name: "E mayúscula con acento grave", keywords: ["e mayuscula grave", "e mayúscula grave", "uppercase e grave", "capital e grave"] },
  { symbol: "Ì", name: "I mayúscula con acento grave", keywords: ["i mayuscula grave", "i mayúscula grave", "uppercase i grave", "capital i grave"] },
  { symbol: "Ò", name: "O mayúscula con acento grave", keywords: ["o mayuscula grave", "o mayúscula grave", "uppercase o grave", "capital o grave"] },
  { symbol: "Ù", name: "U mayúscula con acento grave", keywords: ["u mayuscula grave", "u mayúscula grave", "uppercase u grave", "capital u grave"] },


  // =========================
  // CIRCUNFLEJO
  // =========================

  { symbol: "â", name: "A con circunflejo", keywords: ["a circunflejo", "a con sombrerito", "a circumflex", "circumflex a"] },
  { symbol: "ê", name: "E con circunflejo", keywords: ["e circunflejo", "e con sombrerito", "e circumflex", "circumflex e"] },
  { symbol: "î", name: "I con circunflejo", keywords: ["i circunflejo", "i con sombrerito", "i circumflex", "circumflex i"] },
  { symbol: "ô", name: "O con circunflejo", keywords: ["o circunflejo", "o con sombrerito", "o circumflex", "circumflex o"] },
  { symbol: "û", name: "U con circunflejo", keywords: ["u circunflejo", "u con sombrerito", "u circumflex", "circumflex u"] },

  { symbol: "Â", name: "A mayúscula con circunflejo", keywords: ["a mayuscula circunflejo", "a mayúscula circunflejo", "uppercase a circumflex", "capital a circumflex"] },
  { symbol: "Ê", name: "E mayúscula con circunflejo", keywords: ["e mayuscula circunflejo", "e mayúscula circunflejo", "uppercase e circumflex", "capital e circumflex"] },
  { symbol: "Î", name: "I mayúscula con circunflejo", keywords: ["i mayuscula circunflejo", "i mayúscula circunflejo", "uppercase i circumflex", "capital i circumflex"] },
  { symbol: "Ô", name: "O mayúscula con circunflejo", keywords: ["o mayuscula circunflejo", "o mayúscula circunflejo", "uppercase o circumflex", "capital o circumflex"] },
  { symbol: "Û", name: "U mayúscula con circunflejo", keywords: ["u mayuscula circunflejo", "u mayúscula circunflejo", "uppercase u circumflex", "capital u circumflex"] },


  // =========================
  // DIÉRESIS
  // =========================

  { symbol: "ä", name: "A con diéresis", keywords: ["a dieresis", "a diéresis", "a umlaut", "umlaut a"] },
  { symbol: "ë", name: "E con diéresis", keywords: ["e dieresis", "e diéresis", "e umlaut", "umlaut e"] },
  { symbol: "ï", name: "I con diéresis", keywords: ["i dieresis", "i diéresis", "i umlaut", "umlaut i"] },
  { symbol: "ö", name: "O con diéresis", keywords: ["o dieresis", "o diéresis", "o umlaut", "umlaut o"] },
  { symbol: "ü", name: "U con diéresis", keywords: ["u dieresis", "u diéresis", "u umlaut", "umlaut u"] },

  { symbol: "Ä", name: "A mayúscula con diéresis", keywords: ["a mayuscula dieresis", "a mayúscula diéresis", "uppercase a umlaut", "capital a umlaut"] },
  { symbol: "Ë", name: "E mayúscula con diéresis", keywords: ["e mayuscula dieresis", "e mayúscula diéresis", "uppercase e umlaut", "capital e umlaut"] },
  { symbol: "Ï", name: "I mayúscula con diéresis", keywords: ["i mayuscula dieresis", "i mayúscula diéresis", "uppercase i umlaut", "capital i umlaut"] },
  { symbol: "Ö", name: "O mayúscula con diéresis", keywords: ["o mayuscula dieresis", "o mayúscula diéresis", "uppercase o umlaut", "capital o umlaut"] },
  { symbol: "Ü", name: "U mayúscula con diéresis", keywords: ["u mayuscula dieresis", "u mayúscula diéresis", "uppercase u umlaut", "capital u umlaut"] },


  // =========================
  // VIRGULILLA
  // =========================

  { symbol: "ã", name: "A con virgulilla", keywords: ["a virgulilla", "a tilde portuguesa", "a portuguese", "a nasal"] },
  { symbol: "ẽ", name: "E con virgulilla", keywords: ["e virgulilla", "e tilde portuguesa", "e portuguese", "e nasal"] },
  { symbol: "ĩ", name: "I con virgulilla", keywords: ["i virgulilla", "i tilde portuguesa", "i portuguese", "i nasal"] },
  { symbol: "õ", name: "O con virgulilla", keywords: ["o virgulilla", "o tilde portuguesa", "o portuguese", "o nasal"] },
  { symbol: "ũ", name: "U con virgulilla", keywords: ["u virgulilla", "u tilde portuguesa", "u portuguese", "u nasal"] },

  { symbol: "Ã", name: "A mayúscula con virgulilla", keywords: ["a mayuscula virgulilla", "a mayúscula virgulilla", "uppercase a tilde", "capital a tilde"] },
  { symbol: "Ẽ", name: "E mayúscula con virgulilla", keywords: ["e mayuscula virgulilla", "e mayúscula virgulilla", "uppercase e tilde", "capital e tilde"] },
  { symbol: "Ĩ", name: "I mayúscula con virgulilla", keywords: ["i mayuscula virgulilla", "i mayúscula virgulilla", "uppercase i tilde", "capital i tilde"] },
  { symbol: "Õ", name: "O mayúscula con virgulilla", keywords: ["o mayuscula virgulilla", "o mayúscula virgulilla", "uppercase o tilde", "capital o tilde"] },
  { symbol: "Ũ", name: "U mayúscula con virgulilla", keywords: ["u mayuscula virgulilla", "u mayúscula virgulilla", "uppercase u tilde", "capital u tilde"] },


  // =========================
  // A CON ANILLO
  // =========================

  { symbol: "å", name: "A con anillo", keywords: ["a anillo", "a con circulo", "a con círculo", "a ring", "angstrom"] },
  { symbol: "Å", name: "A mayúscula con anillo", keywords: ["a mayuscula anillo", "a mayúscula anillo", "uppercase a ring", "capital a ring", "angstrom"] },


  // =========================
  // LIGADURAS
  // =========================

  { symbol: "æ", name: "AE ligada", keywords: ["ae", "a e pegadas", "a y e pegadas", "ae ligature", "ash"] },
  { symbol: "Æ", name: "AE ligada mayúscula", keywords: ["ae mayuscula", "ae mayúscula", "a e pegadas mayuscula", "uppercase ae ligature", "capital ae"] },

  { symbol: "œ", name: "OE ligada", keywords: ["oe", "o e pegadas", "o y e pegadas", "oe ligature"] },
  { symbol: "Œ", name: "OE ligada mayúscula", keywords: ["oe mayuscula", "oe mayúscula", "o e pegadas mayuscula", "uppercase oe ligature", "capital oe"] },


  // =========================
  // LETRAS BARRADAS
  // =========================

  { symbol: "ø", name: "O barrada", keywords: ["o barrada", "o tachada", "o con raya", "o slash", "o stroke"] },
  { symbol: "Ø", name: "O barrada mayúscula", keywords: ["o mayuscula barrada", "o mayúscula barrada", "uppercase o stroke", "capital o stroke"] },


  // =========================
  // CEDILLA
  // =========================

  { symbol: "ç", name: "C con cedilla", keywords: ["c cedilla", "c con cedilla", "cedilla", "frances c", "francés c"] },
  { symbol: "Ç", name: "C mayúscula con cedilla", keywords: ["c mayuscula cedilla", "c mayúscula cedilla", "uppercase c cedilla", "capital c cedilla"] },

  // =========================
  // ALFABETO GRIEGO
  // =========================

  { symbol: "α", name: "Alfa", keywords: ["alfa", "alpha", "alfa minuscula", "alfa minúscula", "alpha lowercase", "greek alpha", "letra griega alfa", "greek letter alpha", "alfabeto griego", "greek alphabet"] },

  { symbol: "β", name: "Beta", keywords: ["beta", "beta minuscula", "beta minúscula", "beta lowercase", "greek beta", "letra griega beta", "greek letter beta", "alfabeto griego", "greek alphabet"] },

  { symbol: "γ", name: "Gamma", keywords: ["gamma", "gama", "gamma minuscula", "gamma minúscula", "gamma lowercase", "greek gamma", "letra griega gamma", "greek letter gamma", "alfabeto griego", "greek alphabet"] },
  { symbol: "Γ", name: "Gamma mayúscula", keywords: ["gamma mayuscula", "gamma mayúscula", "gama mayuscula", "gamma uppercase", "capital gamma", "greek gamma uppercase", "alfabeto griego", "greek alphabet"] },

  { symbol: "δ", name: "Delta", keywords: ["delta", "delta minuscula", "delta minúscula", "delta lowercase", "greek delta", "letra griega delta", "greek letter delta", "alfabeto griego", "greek alphabet"] },
  { symbol: "Δ", name: "Delta mayúscula", keywords: ["delta mayuscula", "delta mayúscula", "delta uppercase", "capital delta", "greek delta uppercase", "letra griega delta mayuscula", "alfabeto griego", "greek alphabet"] },

  { symbol: "ε", name: "Épsilon", keywords: ["epsilon", "épsilon", "epsilon minuscula", "epsilon minúscula", "epsilon lowercase", "greek epsilon", "letra griega epsilon", "greek letter epsilon", "alfabeto griego", "greek alphabet"] },

  { symbol: "ζ", name: "Zeta", keywords: ["zeta", "zeta minuscula", "zeta minúscula", "zeta lowercase", "greek zeta", "letra griega zeta", "greek letter zeta", "alfabeto griego", "greek alphabet"] },

  { symbol: "η", name: "Eta", keywords: ["eta", "eta minuscula", "eta minúscula", "eta lowercase", "greek eta", "letra griega eta", "greek letter eta", "alfabeto griego", "greek alphabet"] },

  { symbol: "θ", name: "Theta", keywords: ["theta", "teta", "theta minuscula", "theta minúscula", "theta lowercase", "greek theta", "letra griega theta", "greek letter theta", "alfabeto griego", "greek alphabet"] },
  { symbol: "Θ", name: "Theta mayúscula", keywords: ["theta mayuscula", "theta mayúscula", "teta mayuscula", "theta uppercase", "capital theta", "greek theta uppercase", "alfabeto griego", "greek alphabet"] },

  { symbol: "ι", name: "Iota", keywords: ["iota", "iota minuscula", "iota minúscula", "iota lowercase", "greek iota", "letra griega iota", "greek letter iota", "alfabeto griego", "greek alphabet"] },

  { symbol: "κ", name: "Kappa", keywords: ["kappa", "kapa", "kappa minuscula", "kappa minúscula", "kappa lowercase", "greek kappa", "letra griega kappa", "greek letter kappa", "alfabeto griego", "greek alphabet"] },

  { symbol: "λ", name: "Lambda", keywords: ["lambda", "lamda", "lambda minuscula", "lambda minúscula", "lambda lowercase", "greek lambda", "letra griega lambda", "greek letter lambda", "alfabeto griego", "greek alphabet"] },
  { symbol: "Λ", name: "Lambda mayúscula", keywords: ["lambda mayuscula", "lambda mayúscula", "lamda mayuscula", "lambda uppercase", "capital lambda", "greek lambda uppercase", "alfabeto griego", "greek alphabet"] },

  { symbol: "μ", name: "Mu", keywords: ["micro", "my", "mu", "mu griega", "greek mu", "mu minuscula", "mu minúscula", "mu lowercase", "letra griega mu", "greek letter mu", "alfabeto griego", "greek alphabet"] },

  { symbol: "ν", name: "Nu", keywords: ["nu", "nu minuscula", "nu minúscula", "nu lowercase", "greek nu", "letra griega nu", "greek letter nu", "alfabeto griego", "greek alphabet"] },

  { symbol: "ξ", name: "Xi", keywords: ["xi", "xi minuscula", "xi minúscula", "xi lowercase", "greek xi", "letra griega xi", "greek letter xi", "alfabeto griego", "greek alphabet"] },
  { symbol: "Ξ", name: "Xi mayúscula", keywords: ["xi mayuscula", "xi mayúscula", "xi uppercase", "capital xi", "greek xi uppercase", "letra griega xi mayuscula", "alfabeto griego", "greek alphabet"] },

  { symbol: "π", name: "Pi", keywords: ["pi", "numero pi", "número pi", "pi minuscula", "pi minúscula", "letra griega pi", "greek letter pi"] },
  { symbol: "Π", name: "Pi mayúscula", keywords: ["pi mayuscula", "pi mayúscula", "pi uppercase", "capital pi", "greek pi uppercase", "letra griega pi mayuscula", "alfabeto griego", "greek alphabet"] },

  { symbol: "ρ", name: "Rho", keywords: ["rho", "ro", "rho minuscula", "rho minúscula", "rho lowercase", "greek rho", "letra griega rho", "greek letter rho", "alfabeto griego", "greek alphabet"] },

  { symbol: "σ", name: "Sigma", keywords: ["sigma", "sigma minuscula", "sigma minúscula", "sigma lowercase", "greek sigma", "letra griega sigma", "greek letter sigma", "alfabeto griego", "greek alphabet"] },
  { symbol: "ς", name: "Sigma final", keywords: ["sigma final", "final sigma", "sigma final griega", "greek final sigma", "sigma minuscula final", "sigma minúscula final", "letra griega sigma final", "alfabeto griego", "greek alphabet"] },
  { symbol: "Σ", name: "Sigma mayúscula", keywords: ["sigma mayuscula", "sigma mayúscula", "sigma uppercase", "capital sigma", "greek sigma uppercase", "sumatoria", "summation", "letra griega sigma mayuscula", "alfabeto griego", "greek alphabet"] },

  { symbol: "τ", name: "Tau", keywords: ["tau", "tau minuscula", "tau minúscula", "tau lowercase", "greek tau", "letra griega tau", "greek letter tau", "alfabeto griego", "greek alphabet"] },

  { symbol: "υ", name: "Ípsilon", keywords: ["ipsilon", "ípsilon", "upsilon", "ypsilon", "upsilon lowercase", "greek upsilon", "letra griega ipsilon", "greek letter upsilon", "alfabeto griego", "greek alphabet"] },

  { symbol: "φ", name: "Fi", keywords: ["fi", "phi", "fi griega", "phi lowercase", "greek phi", "letra griega fi", "greek letter phi", "alfabeto griego", "greek alphabet"] },
  { symbol: "Φ", name: "Fi mayúscula", keywords: ["fi mayuscula", "fi mayúscula", "phi uppercase", "capital phi", "greek phi uppercase", "letra griega fi mayuscula", "alfabeto griego", "greek alphabet"] },

  { symbol: "χ", name: "Ji", keywords: ["ji", "chi", "ji griega", "chi lowercase", "greek chi", "letra griega ji", "greek letter chi", "alfabeto griego", "greek alphabet"] },

  { symbol: "ψ", name: "Psi", keywords: ["psi", "psi minuscula", "psi minúscula", "psi lowercase", "greek psi", "letra griega psi", "greek letter psi", "alfabeto griego", "greek alphabet"] },
  { symbol: "Ψ", name: "Psi mayúscula", keywords: ["psi mayuscula", "psi mayúscula", "psi uppercase", "capital psi", "greek psi uppercase", "letra griega psi mayuscula", "alfabeto griego", "greek alphabet"] },

  { symbol: "ω", name: "Omega", keywords: ["omega", "omega minuscula", "omega minúscula", "omega lowercase", "greek omega", "letra griega omega", "greek letter omega", "alfabeto griego", "greek alphabet"] },
  { symbol: "Ω", name: "Omega mayúscula", keywords: ["omega mayuscula", "omega mayúscula", "omega uppercase", "capital omega", "greek omega uppercase", "ohm", "ohmios", "letra griega omega mayuscula", "alfabeto griego", "greek alphabet"] },

];