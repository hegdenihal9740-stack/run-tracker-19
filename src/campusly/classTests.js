// Sample question bank for lesson class tests: 12 questions per module.
// Each lesson test draws 10 of its module's questions in a lesson-specific order.
// Format: [question, [options], index of correct option]
export const QUESTION_BANK = {
  1: [
    [
      "What does AI stand for?",
      ["Automated Input", "Artificial Intelligence", "Applied Integration", "Advanced Interface"],
      1,
    ],
    [
      "Which is a subfield of AI?",
      ["Machine Learning", "Spreadsheets", "Word processing", "Networking"],
      0,
    ],
    ["Which language is most used in data science?", ["COBOL", "Python", "Pascal", "Fortran"], 1],
    [
      "SQL is mainly used to…",
      ["Style web pages", "Query databases", "Edit images", "Compile code"],
      1,
    ],
    ['"Big Data" is usually described by the…', ["3 Cs", "3 Vs", "4 Ps", "2 Ds"], 1],
    ["Which is a cloud provider?", ["AWS", "Excel", "Photoshop", "Linux"], 0],
    [
      "MLOps focuses on…",
      [
        "Deploying and maintaining ML models",
        "Designing logos",
        "Writing emails",
        "Hardware repair",
      ],
      0,
    ],
    [
      "Deep learning is based on…",
      ["Decision tables", "Neural networks", "Linked lists", "Spreadsheets"],
      1,
    ],
    [
      "Data visualization helps to…",
      ["Encrypt data", "Understand data through charts", "Delete data", "Compress files"],
      1,
    ],
    [
      "A dataset row usually represents…",
      ["A column", "One record/observation", "A file type", "A chart"],
      1,
    ],
    [
      "Which is an example of AI in daily life?",
      ["Voice assistants", "Paper calendars", "Light switches", "Staplers"],
      0,
    ],
    ["Supervised learning needs…", ["Labelled data", "No data", "Only images", "Only text"], 0],
  ],
  2: [
    ["Which keyword defines a function in Python?", ["func", "def", "function", "lambda"], 1],
    [
      "What is a class in OOP?",
      ["A loop", "A blueprint for objects", "A variable", "A database"],
      1,
    ],
    ["Which block handles exceptions?", ["if/else", "try/except", "for/while", "import/from"], 1],
    [
      "How do you import a module named math?",
      ["include math", "import math", "using math", "require math"],
      1,
    ],
    ["Which SQL clause filters rows?", ["ORDER BY", "WHERE", "GROUP BY", "SELECT"], 1],
    ["A primary key must be…", ["Unique and not null", "Always text", "Repeated", "Optional"], 0],
    [
      "Which JOIN returns only matching rows?",
      ["LEFT JOIN", "INNER JOIN", "FULL JOIN", "CROSS JOIN"],
      1,
    ],
    ["Which mode opens a file for writing?", ["'r'", "'w'", "'x+'", "'rb'"], 1],
    [
      "Inheritance lets a class…",
      ["Reuse another class’s features", "Delete objects", "Run faster", "Avoid functions"],
      0,
    ],
    [
      "Which library connects Python to MySQL?",
      ["numpy", "mysql-connector", "matplotlib", "flask"],
      1,
    ],
    ["GROUP BY is often used with…", ["Aggregate functions", "CSS", "HTML tags", "Loops"], 0],
    [
      "What does __init__ do in a class?",
      ["Deletes the object", "Initialises a new object", "Prints the class", "Imports modules"],
      1,
    ],
  ],
  3: [
    ["Which library is used for data frames?", ["Pandas", "Flask", "Requests", "Django"], 0],
    [
      "Handling missing values is part of…",
      ["Data cleaning", "Deployment", "Networking", "Styling"],
      0,
    ],
    ["The mean is the…", ["Middle value", "Most frequent value", "Average", "Largest value"], 2],
    [
      "EDA stands for…",
      [
        "Exploratory Data Analysis",
        "External Data Access",
        "Encoded Data Array",
        "Event Driven App",
      ],
      0,
    ],
    ["Which chart best shows a distribution?", ["Histogram", "Pie chart", "Table", "Map"], 0],
    ["Linear regression predicts…", ["Categories", "Continuous values", "Images", "Text"], 1],
    [
      "Standard deviation measures…",
      ["Spread of data", "Total of data", "Data type", "Row count"],
      0,
    ],
    ["Which library is built on Matplotlib?", ["Seaborn", "SQLAlchemy", "PyTorch", "Spark"], 0],
    [
      "A train/test split is used to…",
      ["Evaluate a model on unseen data", "Clean data", "Draw charts", "Store data"],
      0,
    ],
    [
      "An outlier is…",
      ["A value far from the others", "A missing value", "A column name", "A chart type"],
      0,
    ],
    ["Classification predicts…", ["Categories", "Prices only", "Dates only", "Nothing"], 0],
    [
      "df.describe() shows…",
      ["Summary statistics", "Column colours", "File size", "SQL queries"],
      0,
    ],
  ],
  4: [
    [
      "HDFS stands for…",
      [
        "Hadoop Distributed File System",
        "High Data File Storage",
        "Hybrid Data Flow System",
        "Hosted Data File Service",
      ],
      0,
    ],
    ["Hive lets you query big data using…", ["SQL-like language", "Java only", "Excel", "HTML"], 0],
    ["Apache Spark processes data mainly…", ["In memory", "On paper", "On tape", "In browsers"], 0],
    ["Kafka is used for…", ["Streaming events", "Image editing", "Web design", "Spreadsheets"], 0],
    [
      "ETL stands for…",
      [
        "Extract, Transform, Load",
        "Encode, Test, Launch",
        "Edit, Transfer, Link",
        "Export, Train, Learn",
      ],
      0,
    ],
    [
      "A data lake stores…",
      ["Raw data in many formats", "Only tables", "Only images", "Only code"],
      0,
    ],
    [
      "MapReduce has which two phases?",
      ["Map and Reduce", "Read and Write", "Load and Save", "Split and Join"],
      0,
    ],
    [
      "Distributed computing means…",
      ["Work spread across many machines", "One fast computer", "No computers", "Manual work"],
      0,
    ],
    ["A Spark DataFrame is…", ["A distributed table", "A picture", "A web page", "A folder"], 0],
    [
      "A Kafka topic is…",
      ["A named stream of messages", "A database index", "A chart", "A user"],
      0,
    ],
    ["Which is a cloud data warehouse?", ["BigQuery", "Notepad", "Paint", "Zoom"], 0],
    [
      "HDFS replicates data to…",
      ["Avoid data loss", "Use more colour", "Slow down reads", "Delete files"],
      0,
    ],
  ],
  5: [
    [
      "Tableau is mainly a…",
      ["Visualization tool", "Database engine", "Programming language", "Web server"],
      0,
    ],
    ["DAX is used in…", ["Power BI", "Photoshop", "Linux", "Kafka"], 0],
    [
      "A KPI is a…",
      ["Key Performance Indicator", "Known Python Import", "Kernel Process ID", "Key Page Item"],
      0,
    ],
    ["A dashboard should be…", ["Clear and focused", "Crowded", "Text only", "Colourless"], 0],
    ["In Power BI, a measure is…", ["A calculation", "A colour", "A file", "A user"], 0],
    [
      "Which chart compares parts of a whole?",
      ["Pie chart", "Scatter plot", "Line chart", "Histogram"],
      0,
    ],
    [
      "Filters on a dashboard let users…",
      ["Narrow the data shown", "Delete data", "Change the database", "Print faster"],
      0,
    ],
    ["Which shows trends over time best?", ["Line chart", "Pie chart", "Table", "Card"], 0],
    [
      "Publishing a report makes it…",
      ["Available to others", "Deleted", "Private forever", "Encrypted only"],
      0,
    ],
    ["A calculated column is computed…", ["Row by row", "Never", "Only in Excel", "By hand"], 0],
    [
      "Drill-down lets users…",
      ["See more detailed levels", "Close the report", "Change fonts", "Log out"],
      0,
    ],
    [
      "Business Intelligence helps…",
      ["Make data-driven decisions", "Design logos", "Write code", "Repair servers"],
      0,
    ],
  ],
  6: [
    [
      "MLflow is used for…",
      ["Experiment tracking", "Image editing", "Web hosting", "Spreadsheets"],
      0,
    ],
    ["Docker packages apps into…", ["Containers", "Zip files only", "Virtual pens", "Folders"], 0],
    [
      "Kubernetes is used to…",
      ["Orchestrate containers", "Write SQL", "Train models only", "Draw charts"],
      0,
    ],
    [
      "CI/CD stands for…",
      [
        "Continuous Integration / Continuous Delivery",
        "Code Input / Code Data",
        "Cloud Index / Cloud Drive",
        "Central Info / Central Data",
      ],
      0,
    ],
    [
      "Model drift means…",
      [
        "Model performance drops as data changes",
        "The model moves servers",
        "Faster training",
        "Larger files",
      ],
      0,
    ],
    [
      "A Dockerfile describes…",
      ["How to build an image", "A database schema", "A chart", "A user"],
      0,
    ],
    ["A model registry stores…", ["Versioned models", "User passwords", "Images", "Emails"], 0],
    [
      "Hyperparameter tuning aims to…",
      ["Improve model performance", "Delete data", "Change colours", "Add users"],
      0,
    ],
    [
      "A Kubernetes pod is…",
      ["The smallest deployable unit", "A database", "A dashboard", "A file type"],
      0,
    ],
    [
      "Monitoring a model in production checks…",
      ["Accuracy and health over time", "Font size", "Keyboard use", "Logo design"],
      0,
    ],
    [
      "An ML pipeline automates…",
      ["Steps from data to model", "Email replies", "Meetings", "Printing"],
      0,
    ],
    [
      "Ensemble methods combine…",
      ["Multiple models", "Multiple databases", "Multiple users", "Multiple charts"],
      0,
    ],
  ],
  7: [
    [
      "A neuron in a neural network applies…",
      ["Weights and an activation", "A SQL query", "A filter only", "Nothing"],
      0,
    ],
    ["CNNs are best for…", ["Images", "Spreadsheets", "Emails", "Audio files only"], 0],
    [
      "Transfer learning reuses…",
      ["A pre-trained model", "Old passwords", "Random data", "Charts"],
      0,
    ],
    ["LSTM networks handle…", ["Sequences", "Static tables", "Only images", "Logos"], 0],
    [
      "Object detection finds…",
      ["Objects and their locations", "Only colours", "File names", "Users"],
      0,
    ],
    ["Image segmentation labels…", ["Each pixel", "Each file", "Each user", "Each folder"], 0],
    ["ReLU is an…", ["Activation function", "Optimizer", "Dataset", "Loss metric"], 0],
    [
      "Backpropagation is used to…",
      ["Update weights", "Load data", "Draw images", "Save files"],
      0,
    ],
    ["Pooling layers…", ["Reduce spatial size", "Add colour", "Delete images", "Store labels"], 0],
    [
      "Overfitting means the model…",
      ["Memorises training data", "Learns nothing", "Runs faster", "Has no weights"],
      0,
    ],
    [
      "YOLO is a model for…",
      ["Object detection", "Text translation", "SQL tuning", "Clustering"],
      0,
    ],
    [
      "Dropout helps to…",
      ["Reduce overfitting", "Increase file size", "Add layers", "Remove data"],
      0,
    ],
  ],
  8: [
    [
      "NLP stands for…",
      [
        "Natural Language Processing",
        "Neural Layer Program",
        "New Logic Protocol",
        "Network Load Process",
      ],
      0,
    ],
    ["Tokenization splits text into…", ["Tokens", "Images", "Tables", "Files"], 0],
    ["Transformers rely on…", ["Attention", "Pooling only", "Decision trees", "SQL"], 0],
    [
      "LLM stands for…",
      ["Large Language Model", "Linear Logic Machine", "Long Loop Method", "Local Layer Model"],
      0,
    ],
    [
      "RAG combines an LLM with…",
      ["Document retrieval", "Image editing", "Spreadsheets", "Printing"],
      0,
    ],
    ["A vector database stores…", ["Embeddings", "Only text files", "Only images", "Passwords"], 0],
    [
      "Sentiment analysis detects…",
      ["Opinion/emotion in text", "File size", "Image colour", "Network speed"],
      0,
    ],
    [
      "An embedding is…",
      ["A numeric representation of meaning", "A font", "A chart", "A username"],
      0,
    ],
    ["A chatbot framework example is…", ["Rasa", "Excel", "Paint", "Hadoop"], 0],
    [
      "Fine-tuning an LLM means…",
      ["Training it further on specific data", "Deleting it", "Renaming it", "Compressing images"],
      0,
    ],
    [
      "Speech-to-text converts…",
      ["Audio into text", "Text into images", "Images into audio", "Tables into charts"],
      0,
    ],
    [
      "Responsible AI includes…",
      ["Fairness and safety", "Ignoring bias", "Hiding errors", "Skipping tests"],
      0,
    ],
  ],
  9: [
    ["Generative AI creates…", ["New content", "Only reports", "Only backups", "Nothing"], 0],
    [
      "A prompt is…",
      ["The input instruction to a model", "A database", "A chart", "A password"],
      0,
    ],
    [
      "An AI agent can…",
      [
        "Plan and use tools to reach a goal",
        "Only display images",
        "Only store files",
        "Only print",
      ],
      0,
    ],
    [
      "Multi-agent systems involve…",
      ["Several agents working together", "One spreadsheet", "No AI", "Only humans"],
      0,
    ],
    [
      "Hallucination in LLMs means…",
      ["Confident but wrong output", "Fast output", "Empty output", "Encrypted output"],
      0,
    ],
    ["Which generates images from text?", ["Diffusion models", "SQL", "Kafka", "Hive"], 0],
    [
      "Tool calling lets a model…",
      ["Use external functions", "Delete itself", "Change hardware", "Skip prompts"],
      0,
    ],
    [
      "An AI workflow chains…",
      ["Multiple steps or agents", "Only images", "Only users", "Only files"],
      0,
    ],
    [
      "Temperature controls…",
      ["Randomness of output", "CPU heat", "Screen brightness", "File size"],
      0,
    ],
    [
      "Enterprise AI apps must consider…",
      ["Security and privacy", "Only colours", "Only speed", "Nothing"],
      0,
    ],
    [
      "Few-shot prompting gives the model…",
      ["A few examples", "No input", "Only images", "A database"],
      0,
    ],
    [
      "Agent memory helps…",
      ["Keep context across steps", "Delete data", "Change fonts", "Speed up Wi-Fi"],
      0,
    ],
  ],
  10: [
    [
      "A research paper abstract is…",
      ["A short summary", "The references", "The code", "The title only"],
      0,
    ],
    [
      "A literature review…",
      ["Surveys existing work", "Writes code", "Deploys models", "Designs logos"],
      0,
    ],
    ["A hypothesis is…", ["A testable statement", "A final result", "A dataset", "A chart"], 0],
    [
      "Solution architecture describes…",
      ["How system parts fit together", "Only colours", "Office layout", "Staff names"],
      0,
    ],
    [
      "Scalability means a system can…",
      ["Handle growing load", "Only shrink", "Never change", "Run offline only"],
      0,
    ],
    [
      "A capstone project…",
      ["Applies everything learned", "Is optional reading", "Is a quiz", "Is a holiday"],
      0,
    ],
    [
      "Reproducibility means…",
      [
        "Others can repeat your results",
        "Results change randomly",
        "No code is shared",
        "Data is hidden",
      ],
      0,
    ],
    [
      "A baseline model is…",
      ["A simple reference to compare against", "The final model", "A database", "A dashboard"],
      0,
    ],
    [
      "Ablation studies remove…",
      ["Parts of a model to test their effect", "Users", "Data permanently", "Servers"],
      0,
    ],
    [
      "Microservices split an app into…",
      ["Small independent services", "One big file", "Images", "Spreadsheets"],
      0,
    ],
    ["Peer review checks…", ["Quality of research", "Spelling only", "File size", "Colours"], 0],
    [
      "An architecture diagram shows…",
      ["Components and their connections", "Only text", "Marks", "Attendance"],
      0,
    ],
  ],
};

export const QUESTIONS_PER_TEST = 10;

// Same lesson always gets the same 10 questions with shuffled options.
function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}
export function lessonTest(moduleId, lessonNum) {
  const bank = QUESTION_BANK[moduleId] || [];
  const rnd = seeded(moduleId * 1000 + lessonNum);
  const order = bank
    .map((_, i) => i)
    .sort(() => rnd() - 0.5)
    .slice(0, QUESTIONS_PER_TEST);
  return order.map((qi, n) => {
    const [q, opts, ans] = bank[qi];
    const idx = opts.map((_, i) => i).sort(() => rnd() - 0.5);
    return {
      id: `${moduleId}-${lessonNum}-${n}`,
      q,
      options: idx.map((i) => opts[i]),
      answer: idx.indexOf(ans),
    };
  });
}
export const scoreTest = (questions, answers) =>
  questions.reduce((s, q, i) => s + (answers[i] === q.answer ? 1 : 0), 0);
