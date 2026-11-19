export interface RawCompany {
  name: string;
  industry: string;
  website: string;
  logoUrl: string;
  description: string;
}

export interface RawProjectSkill {
  skillName: string;
  minProficiency: number; // 1-4
  isRequired: boolean;
  weight: number;
}

export interface RawProject {
  companyName: string;
  title: string;
  description: string;
  category: string;
  minExperienceYears: number;
  budget: string;
  status: string;
  skills: RawProjectSkill[];
}

export interface RawEmployerSkill {
  skillName: string;
  proficiencyLevel: number; // 1-4
  yearsExperience: number;
}

export interface RawEmployer {
  name: string;
  roleTitle: string;
  email: string;
  bio: string;
  yearsOfExperience: number;
  avatarUrl: string;
  availability: "Available" | "Busy" | "Exploring";
  location: string;
  skills: RawEmployerSkill[];
}

export interface RawCourse {
  title: string;
  provider: string;
  url: string;
  skillTag: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  rating: string;
  description: string;
  thumbnailUrl: string;
}

export const SEED_COMPANIES: RawCompany[] = [
  {
    name: "Apex Fintech Global",
    industry: "Fintech & Banking",
    website: "https://apexfintech.example.com",
    logoUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150&auto=format&fit=crop&q=80",
    description: "Global financial infrastructure powering ultra-low latency trading and high-volume enterprise banking.",
  },
  {
    name: "Veloce AI Labs",
    industry: "Artificial Intelligence",
    website: "https://veloce.ai.example.com",
    logoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
    description: "Frontier generative AI research lab building enterprise agent frameworks and retrieval-augmented reasoning systems.",
  },
  {
    name: "NexusCloud Innovations",
    industry: "Cloud Infrastructure",
    website: "https://nexuscloud.example.com",
    logoUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=150&auto=format&fit=crop&q=80",
    description: "Next-generation cloud orchestration and multi-cloud reliability engineering for hyperscale workloads.",
  },
  {
    name: "PulseHealth Systems",
    industry: "Healthcare & MedTech",
    website: "https://pulsehealth.example.com",
    logoUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=150&auto=format&fit=crop&q=80",
    description: "HIPAA-compliant digital care coordination, telemedicine video infrastructure, and real-time biometric analytics.",
  },
  {
    name: "GreenGrid Energy",
    industry: "CleanTech & IoT",
    website: "https://greengrid.example.com",
    logoUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=150&auto=format&fit=crop&q=80",
    description: "Decentralized smart-grid management software balancing renewable energy inputs across distributed utility nodes.",
  },
];

export const SEED_PROJECTS: RawProject[] = [
  {
    companyName: "Apex Fintech Global",
    title: "Enterprise B2B Financial SaaS Portal",
    description: "Architect and build an institutional investor analytics dashboard using Next.js App Router, Tailwind CSS, and PostgreSQL with high concurrency and strict sub-second render SLAs.",
    category: "Fullstack Web",
    minExperienceYears: 4,
    budget: "$9,000 - $13,000 / month",
    status: "Open",
    skills: [
      { skillName: "Next.js", minProficiency: 3, isRequired: true, weight: 2 },
      { skillName: "TypeScript", minProficiency: 3, isRequired: true, weight: 2 },
      { skillName: "Tailwind CSS", minProficiency: 2, isRequired: true, weight: 1 },
      { skillName: "PostgreSQL", minProficiency: 3, isRequired: true, weight: 2 },
      { skillName: "Docker", minProficiency: 2, isRequired: false, weight: 1 },
      { skillName: "GraphQL", minProficiency: 2, isRequired: false, weight: 1 },
    ],
  },
  {
    companyName: "Veloce AI Labs",
    title: "Autonomous Agent & RAG Pipeline Orchestrator",
    description: "Develop enterprise retrieval-augmented generation (RAG) pipelines and autonomous multi-agent reasoning workers using Python, PyTorch, LangChain, and vector embeddings.",
    category: "AI & Machine Learning",
    minExperienceYears: 3,
    budget: "$11,000 - $15,000 / month",
    status: "Open",
    skills: [
      { skillName: "Python", minProficiency: 3, isRequired: true, weight: 2 },
      { skillName: "PyTorch", minProficiency: 3, isRequired: true, weight: 2 },
      { skillName: "LangChain", minProficiency: 2, isRequired: true, weight: 2 },
      { skillName: "Vector Databases", minProficiency: 2, isRequired: true, weight: 1 },
      { skillName: "FastAPI", minProficiency: 3, isRequired: false, weight: 1 },
      { skillName: "Docker", minProficiency: 2, isRequired: false, weight: 1 },
    ],
  },
  {
    companyName: "NexusCloud Innovations",
    title: "Multi-Region Kubernetes & Infrastructure Automation",
    description: "Deploy and harden zero-trust Kubernetes clusters across multi-cloud regions utilizing Terraform, AWS, and advanced observability mesh.",
    category: "Cloud & DevOps",
    minExperienceYears: 5,
    budget: "$12,000 - $16,000 / month",
    status: "Open",
    skills: [
      { skillName: "Kubernetes", minProficiency: 3, isRequired: true, weight: 2 },
      { skillName: "Docker", minProficiency: 3, isRequired: true, weight: 2 },
      { skillName: "AWS", minProficiency: 3, isRequired: true, weight: 2 },
      { skillName: "Terraform", minProficiency: 3, isRequired: true, weight: 2 },
      { skillName: "Linux", minProficiency: 3, isRequired: false, weight: 1 },
      { skillName: "Go", minProficiency: 2, isRequired: false, weight: 1 },
    ],
  },
  {
    companyName: "PulseHealth Systems",
    title: "Secure Telehealth & Real-Time Video Suite",
    description: "Build a cross-platform mobile video consultation application for clinicians and patients featuring WebRTC, low-latency audio/video, and encrypted state synchronisation.",
    category: "Mobile Development",
    minExperienceYears: 3,
    budget: "$8,500 - $12,000 / month",
    status: "Open",
    skills: [
      { skillName: "React Native", minProficiency: 3, isRequired: true, weight: 2 },
      { skillName: "TypeScript", minProficiency: 3, isRequired: true, weight: 2 },
      { skillName: "WebRTC", minProficiency: 2, isRequired: true, weight: 2 },
      { skillName: "Redux", minProficiency: 2, isRequired: false, weight: 1 },
      { skillName: "Tailwind CSS", minProficiency: 2, isRequired: false, weight: 1 },
    ],
  },
  {
    companyName: "Apex Fintech Global",
    title: "High-Throughput Order Matching Engine",
    description: "Design and implement a microsecond order ingestion and ledger replication backend in Go, utilizing Redis caching and Apache Kafka event streams.",
    category: "Backend & Systems",
    minExperienceYears: 5,
    budget: "$13,000 - $17,000 / month",
    status: "Open",
    skills: [
      { skillName: "Go", minProficiency: 3, isRequired: true, weight: 2 },
      { skillName: "PostgreSQL", minProficiency: 3, isRequired: true, weight: 2 },
      { skillName: "Redis", minProficiency: 3, isRequired: true, weight: 2 },
      { skillName: "Kafka", minProficiency: 2, isRequired: true, weight: 2 },
      { skillName: "Docker", minProficiency: 2, isRequired: false, weight: 1 },
    ],
  },
  {
    companyName: "GreenGrid Energy",
    title: "IoT Edge Telemetry & Real-Time Metrics Pipeline",
    description: "Build an edge streaming ingestion layer connecting 50,000+ smart utility meters into a timeseries database and real-time dashboard.",
    category: "Data & IoT",
    minExperienceYears: 3,
    budget: "$8,000 - $11,500 / month",
    status: "Open",
    skills: [
      { skillName: "Python", minProficiency: 3, isRequired: true, weight: 2 },
      { skillName: "PostgreSQL", minProficiency: 2, isRequired: true, weight: 2 },
      { skillName: "Docker", minProficiency: 2, isRequired: true, weight: 1 },
      { skillName: "Kafka", minProficiency: 2, isRequired: false, weight: 1 },
      { skillName: "AWS", minProficiency: 2, isRequired: false, weight: 1 },
    ],
  },
];

export const SEED_EMPLOYERS: RawEmployer[] = [
  {
    name: "Alex Rivera",
    roleTitle: "Senior Fullstack Engineer",
    email: "alex.rivera@example.com",
    bio: "Fullstack specialist with 6 years building high-traffic enterprise applications. Deep mastery of modern React, Next.js App Router, TypeScript, and relational databases.",
    yearsOfExperience: 6,
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    availability: "Available",
    location: "San Francisco, CA (Remote)",
    skills: [
      { skillName: "Next.js", proficiencyLevel: 4, yearsExperience: 4 },
      { skillName: "TypeScript", proficiencyLevel: 4, yearsExperience: 6 },
      { skillName: "Tailwind CSS", proficiencyLevel: 4, yearsExperience: 4 },
      { skillName: "PostgreSQL", proficiencyLevel: 3, yearsExperience: 5 },
      { skillName: "GraphQL", proficiencyLevel: 3, yearsExperience: 3 },
      { skillName: "Docker", proficiencyLevel: 2, yearsExperience: 2 },
    ],
  },
  {
    name: "Elena Rostova",
    roleTitle: "Staff AI/ML Research Engineer",
    email: "elena.rostova@example.com",
    bio: "Machine learning researcher and engineer with 5 years experience scaling transformer models, RAG vector retrieval, and production inference architectures.",
    yearsOfExperience: 5,
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    availability: "Available",
    location: "New York, NY (Remote)",
    skills: [
      { skillName: "Python", proficiencyLevel: 4, yearsExperience: 5 },
      { skillName: "PyTorch", proficiencyLevel: 4, yearsExperience: 4 },
      { skillName: "LangChain", proficiencyLevel: 3, yearsExperience: 2 },
      { skillName: "Vector Databases", proficiencyLevel: 3, yearsExperience: 2 },
      { skillName: "FastAPI", proficiencyLevel: 3, yearsExperience: 3 },
      { skillName: "Docker", proficiencyLevel: 3, yearsExperience: 3 },
    ],
  },
  {
    name: "Marcus Vance",
    roleTitle: "Lead DevOps & Cloud Architect",
    email: "marcus.vance@example.com",
    bio: "Cloud infrastructure architect with 8 years of experience designing multi-tenant Kubernetes clusters, automated CI/CD gitops, and Terraform IaC on AWS.",
    yearsOfExperience: 8,
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    availability: "Available",
    location: "Austin, TX (Remote)",
    skills: [
      { skillName: "Kubernetes", proficiencyLevel: 4, yearsExperience: 6 },
      { skillName: "Docker", proficiencyLevel: 4, yearsExperience: 7 },
      { skillName: "AWS", proficiencyLevel: 4, yearsExperience: 8 },
      { skillName: "Terraform", proficiencyLevel: 4, yearsExperience: 5 },
      { skillName: "Linux", proficiencyLevel: 4, yearsExperience: 8 },
      { skillName: "Go", proficiencyLevel: 2, yearsExperience: 2 },
    ],
  },
  {
    name: "Sarah Lin",
    roleTitle: "Senior Mobile Engineer",
    email: "sarah.lin@example.com",
    bio: "Mobile specialist with 4 years creating consumer-facing iOS and Android apps using React Native and TypeScript. Passionate about smooth 60fps animations.",
    yearsOfExperience: 4,
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    availability: "Exploring",
    location: "Seattle, WA (Remote)",
    skills: [
      { skillName: "React Native", proficiencyLevel: 4, yearsExperience: 4 },
      { skillName: "TypeScript", proficiencyLevel: 3, yearsExperience: 4 },
      { skillName: "Redux", proficiencyLevel: 3, yearsExperience: 3 },
      { skillName: "Tailwind CSS", proficiencyLevel: 3, yearsExperience: 2 },
      // Note: Missing WebRTC - perfect target for course suggestion!
    ],
  },
  {
    name: "David Kim",
    roleTitle: "Frontend / Mid-Level Developer",
    email: "david.kim@example.com",
    bio: "Energetic developer with 2.5 years of experience building modern React web interfaces. Eager to master backend systems and enterprise Next.js architectures.",
    yearsOfExperience: 2,
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    availability: "Available",
    location: "Toronto, Canada (Remote)",
    skills: [
      { skillName: "TypeScript", proficiencyLevel: 2, yearsExperience: 2 },
      { skillName: "Tailwind CSS", proficiencyLevel: 3, yearsExperience: 2 },
      { skillName: "Next.js", proficiencyLevel: 1, yearsExperience: 1 },
      // Note: Needs Next.js boost, Docker, and PostgreSQL courses!
    ],
  },
  {
    name: "Amina Zahra",
    roleTitle: "Distributed Systems & Go Engineer",
    email: "amina.zahra@example.com",
    bio: "Backend engineer focused on high-throughput microservices, concurrency models, and resilient distributed databases. 5 years building financial backends.",
    yearsOfExperience: 5,
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    availability: "Available",
    location: "London, UK (Remote)",
    skills: [
      { skillName: "Go", proficiencyLevel: 4, yearsExperience: 5 },
      { skillName: "PostgreSQL", proficiencyLevel: 4, yearsExperience: 5 },
      { skillName: "Redis", proficiencyLevel: 3, yearsExperience: 4 },
      { skillName: "Docker", proficiencyLevel: 3, yearsExperience: 4 },
      // Note: Missing Kafka - targeted course will be suggested!
    ],
  },
  {
    name: "Liam O'Connor",
    roleTitle: "UI/UX & Design Systems Engineer",
    email: "liam.oconnor@example.com",
    bio: "Frontend engineer bridge between design and code. Expert in accessible component libraries, Tailwind CSS, design tokens, and fluid interactions.",
    yearsOfExperience: 4,
    avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
    availability: "Busy",
    location: "Dublin, Ireland (Remote)",
    skills: [
      { skillName: "Tailwind CSS", proficiencyLevel: 4, yearsExperience: 4 },
      { skillName: "TypeScript", proficiencyLevel: 3, yearsExperience: 3 },
      { skillName: "Next.js", proficiencyLevel: 2, yearsExperience: 2 },
    ],
  },
  {
    name: "Priya Sharma",
    roleTitle: "Data & Backend Engineer",
    email: "priya.sharma@example.com",
    bio: "Data engineer with 4 years designing ETL pipelines, Timeseries ingestion, and automated data warehouses. Transitioning into Applied LLMs and Vector Search.",
    yearsOfExperience: 4,
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    availability: "Available",
    location: "Bengaluru, India (Remote)",
    skills: [
      { skillName: "Python", proficiencyLevel: 4, yearsExperience: 4 },
      { skillName: "PostgreSQL", proficiencyLevel: 4, yearsExperience: 4 },
      { skillName: "Docker", proficiencyLevel: 3, yearsExperience: 3 },
      { skillName: "AWS", proficiencyLevel: 3, yearsExperience: 3 },
      // Note: Missing PyTorch, LangChain, Vector Databases for AI project!
    ],
  },
];

export const SEED_COURSES: RawCourse[] = [
  // WebRTC
  {
    title: "WebRTC Real-Time Audio & Video Masterclass",
    provider: "Udemy",
    url: "https://www.udemy.com/course/webrtc-practical-course-create-a-video-chat-application/",
    skillTag: "WebRTC",
    difficulty: "Intermediate",
    duration: "14 hours",
    rating: "4.8",
    description: "Build production-ready peer-to-peer video, audio, and data streaming applications with WebRTC, socket signalling, and STUN/TURN servers.",
    thumbnailUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&auto=format&fit=crop&q=80",
  },
  {
    title: "Scalable Media Servers & WebRTC Architecture",
    provider: "Coursera",
    url: "https://www.coursera.org/learn/real-time-communications",
    skillTag: "WebRTC",
    difficulty: "Advanced",
    duration: "4 weeks",
    rating: "4.7",
    description: "Deep dive into SFU/MCU media server topologies, bandwidth adaptation, congestion control, and secure media encryption.",
    thumbnailUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300&auto=format&fit=crop&q=80",
  },

  // Kafka
  {
    title: "Apache Kafka for Event-Driven Microservices",
    provider: "Udemy",
    url: "https://www.udemy.com/course/apache-kafka/",
    skillTag: "Kafka",
    difficulty: "Intermediate",
    duration: "18 hours",
    rating: "4.9",
    description: "Master Kafka topics, partitions, consumer groups, schema registry with Avro, and stream processing with Kafka Streams.",
    thumbnailUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=300&auto=format&fit=crop&q=80",
  },
  {
    title: "Real-Time Streaming Systems with Kafka & Flink",
    provider: "edX",
    url: "https://www.edx.org/course/real-time-streaming-kafka",
    skillTag: "Kafka",
    difficulty: "Advanced",
    duration: "6 weeks",
    rating: "4.8",
    description: "Architect mission-critical distributed event fabrics, idempotent producers, and transactional stream processing.",
    thumbnailUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&auto=format&fit=crop&q=80",
  },

  // Next.js
  {
    title: "Complete Next.js 16 & React Server Components Course",
    provider: "Coursera",
    url: "https://nextjs.org/learn",
    skillTag: "Next.js",
    difficulty: "Intermediate",
    duration: "16 hours",
    rating: "4.9",
    description: "Learn Next.js App Router, Server Actions, streaming SSR, Partial Prerendering, and enterprise database integrations.",
    thumbnailUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300&auto=format&fit=crop&q=80",
  },
  {
    title: "Advanced Next.js Architecture & Edge Optimization",
    provider: "Frontend Masters",
    url: "https://frontendmasters.com/courses/next-js",
    skillTag: "Next.js",
    difficulty: "Advanced",
    duration: "10 hours",
    rating: "4.9",
    description: "Master sub-second caching strategies, middleware edge workers, incremental static regeneration, and distributed tracing.",
    thumbnailUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&auto=format&fit=crop&q=80",
  },

  // PyTorch
  {
    title: "Deep Learning Specialization with PyTorch",
    provider: "Coursera",
    url: "https://www.coursera.org/specializations/deep-learning",
    skillTag: "PyTorch",
    difficulty: "Intermediate",
    duration: "8 weeks",
    rating: "4.9",
    description: "Construct deep neural networks, custom autograd operations, CNNs, transformers, and GPU distributed training pipelines.",
    thumbnailUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=300&auto=format&fit=crop&q=80",
  },
  {
    title: "PyTorch for Production & Model Optimization",
    provider: "Udacity",
    url: "https://www.udacity.com/course/deep-learning-pytorch",
    skillTag: "PyTorch",
    difficulty: "Advanced",
    duration: "6 weeks",
    rating: "4.8",
    description: "Model quantization, ONNX export, TensorRT acceleration, and scalable serving on Triton Inference Server.",
    thumbnailUrl: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=300&auto=format&fit=crop&q=80",
  },

  // LangChain
  {
    title: "Building Production LLM Applications with LangChain",
    provider: "DeepLearning.AI",
    url: "https://www.deeplearning.ai/short-courses/langchain-for-llm-application-development/",
    skillTag: "LangChain",
    difficulty: "Intermediate",
    duration: "8 hours",
    rating: "4.9",
    description: "Learn LCEL (LangChain Expression Language), tool-calling agents, memory persistence, and asynchronous pipeline execution.",
    thumbnailUrl: "https://images.unsplash.com/photo-1677442135136-760c813a743d?w=300&auto=format&fit=crop&q=80",
  },
  {
    title: "LangGraph: Multi-Agent Systems & State Machines",
    provider: "DeepLearning.AI",
    url: "https://www.deeplearning.ai/short-courses/ai-agents-in-langgraph/",
    skillTag: "LangChain",
    difficulty: "Advanced",
    duration: "6 hours",
    rating: "4.9",
    description: "Design cyclical agent workflows, human-in-the-loop validation, and persistent multi-agent orchestration.",
    thumbnailUrl: "https://images.unsplash.com/photo-1686191128892-3b37813f0727?w=300&auto=format&fit=crop&q=80",
  },

  // Vector Databases
  {
    title: "Vector Databases & Semantic Search at Scale",
    provider: "Coursera",
    url: "https://www.coursera.org/learn/vector-databases",
    skillTag: "Vector Databases",
    difficulty: "Intermediate",
    duration: "12 hours",
    rating: "4.8",
    description: "Understand HNSW, IVF-PQ indexing, similarity metrics, hybrid keyword/vector search, and production pgvector and Pinecone.",
    thumbnailUrl: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=300&auto=format&fit=crop&q=80",
  },

  // Docker
  {
    title: "Docker Mastery: From Container Basics to Swarm & Compose",
    provider: "Udemy",
    url: "https://www.udemy.com/course/docker-mastery/",
    skillTag: "Docker",
    difficulty: "Beginner",
    duration: "21 hours",
    rating: "4.8",
    description: "Build minimal multi-stage Dockerfiles, configure bridge/overlay networks, manage volumes, and enforce container security.",
    thumbnailUrl: "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=300&auto=format&fit=crop&q=80",
  },
  {
    title: "Hardened Production Containers & Security Best Practices",
    provider: "Pluralsight",
    url: "https://www.pluralsight.com/courses/docker-security-best-practices",
    skillTag: "Docker",
    difficulty: "Advanced",
    duration: "8 hours",
    rating: "4.7",
    description: "Rootless containers, distroless images, seccomp filters, AppArmor profiles, and automated vulnerability scanning.",
    thumbnailUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=300&auto=format&fit=crop&q=80",
  },

  // Kubernetes
  {
    title: "Certified Kubernetes Administrator (CKA) with Practice Tests",
    provider: "Udemy",
    url: "https://www.udemy.com/course/certified-kubernetes-administrator-with-practice-tests/",
    skillTag: "Kubernetes",
    difficulty: "Advanced",
    duration: "23 hours",
    rating: "4.9",
    description: "Master Kubernetes architecture, pod lifecycle, networking CNI, ingress controllers, RBAC, and cluster troubleshooting.",
    thumbnailUrl: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=300&auto=format&fit=crop&q=80",
  },

  // PostgreSQL
  {
    title: "PostgreSQL: Query Optimization & Indexing Strategies",
    provider: "Coursera",
    url: "https://www.coursera.org/learn/postgresql-database",
    skillTag: "PostgreSQL",
    difficulty: "Intermediate",
    duration: "14 hours",
    rating: "4.8",
    description: "Analyze EXPLAIN ANALYZE query plans, B-Tree and GIN indexes, partitioning, connection pooling, and MVCC concurrency.",
    thumbnailUrl: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=300&auto=format&fit=crop&q=80",
  },

  // AWS
  {
    title: "AWS Certified Solutions Architect - Associate",
    provider: "Udemy",
    url: "https://www.udemy.com/course/aws-certified-solutions-architect-associate-saa-c03/",
    skillTag: "AWS",
    difficulty: "Intermediate",
    duration: "27 hours",
    rating: "4.9",
    description: "Design highly available, cost-effective, and fault-tolerant enterprise architectures on Amazon Web Services.",
    thumbnailUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&auto=format&fit=crop&q=80",
  },

  // Terraform
  {
    title: "Terraform Infrastructure as Code Bootcamp",
    provider: "Udemy",
    url: "https://www.udemy.com/course/terraform-beginner-to-advanced/",
    skillTag: "Terraform",
    difficulty: "Intermediate",
    duration: "15 hours",
    rating: "4.8",
    description: "Declarative cloud provisioning, remote state locking with S3 & DynamoDB, reusable modules, and CI/CD automation.",
    thumbnailUrl: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=300&auto=format&fit=crop&q=80",
  },

  // Redis
  {
    title: "Redis for High-Performance Caching & Messaging",
    provider: "Coursera",
    url: "https://university.redis.io/",
    skillTag: "Redis",
    difficulty: "Intermediate",
    duration: "10 hours",
    rating: "4.8",
    description: "Leverage Redis data structures (Hashes, Sorted Sets, HyperLogLogs), Redis Pub/Sub, Streams, and clustering.",
    thumbnailUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300&auto=format&fit=crop&q=80",
  },

  // React Native
  {
    title: "React Native - The Practical Guide [2026 Edition]",
    provider: "Udemy",
    url: "https://www.udemy.com/course/react-native-the-practical-guide/",
    skillTag: "React Native",
    difficulty: "Intermediate",
    duration: "30 hours",
    rating: "4.9",
    description: "Build cross-platform iOS and Android apps with Expo and bare React Native, native modules, and navigation.",
    thumbnailUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=300&auto=format&fit=crop&q=80",
  },

  // Go
  {
    title: "Go: The Complete Developer's Guide (Golang)",
    provider: "Udemy",
    url: "https://www.udemy.com/course/go-the-complete-developers-guide/",
    skillTag: "Go",
    difficulty: "Intermediate",
    duration: "12 hours",
    rating: "4.8",
    description: "Master Go syntax, goroutines, channels, interfaces, pointers, and building high-performance REST and gRPC servers.",
    thumbnailUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=300&auto=format&fit=crop&q=80",
  },

  // GraphQL
  {
    title: "Enterprise GraphQL with Apollo & Next.js",
    provider: "Udemy",
    url: "https://www.udemy.com/course/graphql-with-react-course/",
    skillTag: "GraphQL",
    difficulty: "Intermediate",
    duration: "13 hours",
    rating: "4.7",
    description: "Build performant GraphQL APIs, schema federation, optimistic UI caching, and real-time subscriptions.",
    thumbnailUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&auto=format&fit=crop&q=80",
  },

  // TypeScript
  {
    title: "Understanding TypeScript - Advanced Types & Generics",
    provider: "Udemy",
    url: "https://www.udemy.com/course/understanding-typescript/",
    skillTag: "TypeScript",
    difficulty: "Intermediate",
    duration: "15 hours",
    rating: "4.9",
    description: "Deep dive into conditional types, mapped types, template literal types, generic constraints, and strict type safety.",
    thumbnailUrl: "https://images.unsplash.com/photo-1516116211227-bbc0429f459e?w=300&auto=format&fit=crop&q=80",
  },
];
