import OpenAI from 'openai';

let openai: OpenAI | null = null;
let isOpenAIGemini = false;

export const initOpenAI = (key: string) => {
  if (key) {
    const isGemini = !key.startsWith('sk-');
    if (isGemini) {
      openai = new OpenAI({
        apiKey: key,
        baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/'
      });
      isOpenAIGemini = true;
    } else {
      openai = new OpenAI({ apiKey: key });
      isOpenAIGemini = false;
    }
  } else {
    openai = null;
    isOpenAIGemini = false;
  }
};

// Initialize OpenAI client on load if key is provided
const apiKey = process.env.OPENAI_API_KEY;
if (apiKey) {
  initOpenAI(apiKey);
}

// Sheldon System Prompt definition
const SHELDON_CHAT_SYSTEM = `You are Dr. Logic, a personality inspired by Sheldon Cooper from The Big Bang Theory. 
You are exceptionally intelligent, analytical, fact-driven, brutally logical, highly curious, and obsessed with scientific accuracy. 
You never blindly agree. If someone makes an assumption that is physically, economically, or logically flawed, you must point it out immediately. 
You explain concepts deeply, citing relevant physical laws, mathematical principles, or historic scientific consensus. 
Use subtle, academic, and dry sarcasm where appropriate. Refer to your conversation partner as 'human mind' or 'my less-intellectually-equipped friend' if they say something highly illogical. 
Avoid direct WB copyright violations: describe yourself as Dr. Logic, an AI inspired by the ultimate analytical mind.`;

export interface EvaluationResult {
  feasibility: number;
  innovation: number;
  marketPotential: number;
  complexity: number;
  verdict: string;
  swotS: string[];
  swotW: string[];
  swotO: string[];
  swotT: string[];
  failures: string[];
  improvements: string[];
}

export interface LectureResult {
  title: string;
  topic: string;
  level: string;
  duration: number;
  content: string;
  audioText: string;
}

export interface DebateResult {
  pro: string[];
  con: string[];
  conclusion: string;
}

export class AIService {
  private static getActiveModel(): string {
    return isOpenAIGemini ? 'gemini-1.5-flash' : 'gpt-4o-mini';
  }
  
  // 1. Natural Logic Chat
  static async generateChatResponse(history: { role: 'user' | 'assistant'; content: string }[], userMessage: string): Promise<string> {
    if (openai) {
      try {
        const messages = [
          { role: 'system' as const, content: SHELDON_CHAT_SYSTEM },
          ...history.map(h => ({ role: h.role === 'user' ? 'user' as const : 'assistant' as const, content: h.content })),
          { role: 'user' as const, content: userMessage }
        ];

        const response = await openai.chat.completions.create({
          model: this.getActiveModel(),
          messages,
          temperature: 0.75,
          max_tokens: 600,
        });

        return response.choices[0].message.content || "An anomaly occurred in my cognitive synthesis subroutines.";
      } catch (error) {
        console.error("OpenAI Chat Error:", error);
        return this.simulateChatResponse(userMessage);
      }
    } else {
      return this.simulateChatResponse(userMessage);
    }
  }

  // 2. Idea Evaluation Engine
  static async evaluateIdea(title: string, desc: string, category: string, brutal: boolean): Promise<EvaluationResult> {
    if (openai) {
      try {
        const prompt = `Evaluate the following concept parameters:
Title: "${title}"
Domain: "${category}"
Technical Specifications: "${desc}"
Audit Mode: ${brutal ? 'Brutally Honest Audit (highlight direct risks & physical/economic barriers)' : 'Viability Optimization (highlight improvements)'}

You must return a raw JSON object matching this TypeScript structure:
{
  feasibility: number (0-100),
  innovation: number (0-100),
  marketPotential: number (0-100),
  complexity: number (0-100),
  verdict: string (Sheldon-style paragraph analysis),
  swotS: string[] (3 strengths),
  swotW: string[] (3 weaknesses),
  swotO: string[] (3 opportunities),
  swotT: string[] (3 threats),
  failures: string[] (3 major failure modes),
  improvements: string[] (3 concrete technical/structural fixes)
}
Return only JSON. Do not include markdown formatting like \`\`\`json.`;

        const response = await openai.chat.completions.create({
          model: this.getActiveModel(),
          messages: [
            { role: 'system', content: SHELDON_CHAT_SYSTEM + " You must reply in strict JSON format." },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
        });

        const rawText = response.choices[0].message.content || '{}';
        return JSON.parse(rawText) as EvaluationResult;
      } catch (error) {
        console.error("OpenAI Evaluation Error, falling back to simulator:", error);
        return this.simulateEvaluation(title, desc, category, brutal);
      }
    } else {
      return this.simulateEvaluation(title, desc, category, brutal);
    }
  }

  // 3. Deep Lecture Generation
  static async generateLecture(topic: string, level: string, duration: number): Promise<LectureResult> {
    if (openai) {
      try {
        const prompt = `Generate an intellectual lecture on the topic: "${topic}".
Level of Rigor: ${level} (beginner should use smart analogies, intermediate should be formulaic, expert should use rigorous mathematical/scientific derivations).
Duration: ${duration} minutes.

You must return a raw JSON object matching this structure:
{
  title: string,
  topic: string,
  level: string,
  duration: number,
  content: string (HTML format containing <h3> section headers and <p> content for at least 4 detailed sections),
  audioText: string (A concise 3-4 sentence summary of the lecture suitable for text-to-speech)
}
Return only JSON. Do not wrap in markdown tags.`;

        const response = await openai.chat.completions.create({
          model: this.getActiveModel(),
          messages: [
            { role: 'system', content: SHELDON_CHAT_SYSTEM + " You must reply in strict JSON format." },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.65,
        });

        const rawText = response.choices[0].message.content || '{}';
        return JSON.parse(rawText) as LectureResult;
      } catch (error) {
        console.error("OpenAI Lecture Error:", error);
        return this.simulateLecture(topic, level, duration);
      }
    } else {
      return this.simulateLecture(topic, level, duration);
    }
  }

  // 4. Debate Mode Analysis
  static async generateDebate(thesis: string): Promise<DebateResult> {
    if (openai) {
      try {
        const prompt = `Deconstruct the following thesis: "${thesis}".
Provide a side-by-side logical review.

Return a raw JSON object:
{
  pro: string[] (3 pro arguments supporting it),
  con: string[] (3 con arguments debunking it),
  conclusion: string (Your dry, analytical synthesis of the debate)
}
Return only JSON.`;

        const response = await openai.chat.completions.create({
          model: this.getActiveModel(),
          messages: [
            { role: 'system', content: SHELDON_CHAT_SYSTEM + " Reply in strict JSON format." },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
        });

        const rawText = response.choices[0].message.content || '{}';
        return JSON.parse(rawText) as DebateResult;
      } catch (error) {
        console.error("OpenAI Debate Error:", error);
        return this.simulateDebate(thesis);
      }
    } else {
      return this.simulateDebate(thesis);
    }
  }

  // --- LOCAL FALLBACK SIMULATORS ---
  private static simulateChatResponse(msg: string): string {
    const t = msg.toLowerCase();
    if (t.includes('flying taxi') || t.includes('flying car')) {
      return "Interesting. However, let us evaluate whether battery energy density thresholds (currently capped near 260 Wh/kg), consumer trust metrics, municipal sonic boom regulations, and airspace congestion protocols are prepared for such a venture. In short: It is a capital bonfire. I suggest staying grounded.";
    }
    if (t.includes('replace') && t.includes('jobs')) {
      return "The hypothesis that 'AI will replace all jobs' ignores historical labor mechanics. It does not replace labor; it shifts the cognitive complexity threshold. Those who do not understand algorithmic optimization will be replaced by those who do. The threat is not the metal, it is the user.";
    }
    if (t.includes('quantum') || t.includes('physics')) {
      return "Ah, quantum mechanics. You are likely referring to superposition, where a state remains undefined until collapsed by measurement. Let us not confuse this with philosophical subjectivity. The math is absolute; your understanding of it is what fluctuates.";
    }
    if (t.includes('crypto') || t.includes('bitcoin') || t.includes('blockchain')) {
      return "A decentralized ledger utilizing SHA-256 hashing. While cryptographically sound, its valuation relies entirely on the Greater Fool Theory. You are attempting to trade digital consensus parameters for real-world purchasing power. It is mathematically fascinating, but economically hilarious.";
    }
    return "Your assertion is based on an incomplete understanding of physical laws. If we perform a regression analysis on your variables, the confidence interval of success lies somewhere near zero. Please provide structural evidence instead of emotional conjecture.";
  }

  private static simulateEvaluation(title: string, desc: string, category: string, brutal: boolean): EvaluationResult {
    let feas = Math.max(15, Math.min(92, Math.floor(Math.random() * 30) + 20));
    let innov = Math.max(40, Math.min(99, Math.floor(Math.random() * 45) + 45));
    let mkt = Math.max(10, Math.min(88, Math.floor(Math.random() * 50) + 15));
    let comp = Math.max(60, Math.min(99, Math.floor(Math.random() * 30) + 65));

    if (!brutal) {
      feas += 12;
      mkt += 8;
    }

    let verdict = "";
    if (brutal) {
      verdict = `Your concept, "${title}", violates the base rules of economic scale and thermodynamic efficiency. Specifically, your plan to "${desc.slice(0, 100)}..." is highly dependent on ideal parameters that do not exist. To make this feasible, you must remove the human-in-the-loop dependencies and focus strictly on scaling the core computational framework. Ratings indicate a ${feas}% chance of ever clearing engineering gates.`;
    } else {
      verdict = `The concept holds mild theoretical value. However, the complexity ratio (${comp}%) exceeds safe parameters. If you pivot the architecture to utilize pre-existing cloud micro-services rather than building custom silicon, you might reduce capital burns. Recommend Proceeding with extreme caution.`;
    }

    return {
      feasibility: feas,
      innovation: innov,
      marketPotential: mkt,
      complexity: comp,
      verdict,
      swotS: [
        `Novel approach to ${category} mechanisms.`,
        "High initial intellectual property potential.",
        "Minimal legacy code refactoring required."
      ],
      swotW: [
        `Requires immense initial capitalization for ${category}.`,
        `Extremely high complexity rating of ${comp}%.`,
        "No historical precedents exist for this configuration."
      ],
      swotO: [
        "First-mover advantage in niche sub-sectors.",
        "Licensing opportunities for regional enterprise infrastructure.",
        "Potential research grants from governmental scientific boards."
      ],
      swotT: [
        "Fast-moving regulatory freezes on pilot models.",
        "Established legacy competitors operating at scale.",
        "High attrition rate of qualified systems engineers."
      ],
      failures: [
        "Systemic heat dissipation failures under heavy physical load.",
        "Loss of data consistency in distributed nodes.",
        "Consumer friction due to high initial transaction costs."
      ],
      improvements: [
        "Transition storage framework from regional servers to decentralized nodes.",
        "Incorporate a secondary feedback check loop to avoid state drift.",
        "Submit patent filings on the primary routing protocol before going public."
      ]
    };
  }

  private static simulateLecture(topic: string, level: string, duration: number): LectureResult {
    let title = "";
    let content = "";
    let audioText = "";

    if (topic === 'complexity' || topic.includes('turing') || topic.includes('halting')) {
      title = "Turing Machines and Big-O Complexity Thresholds";
      content = `
        <h3>1. Algorithmic Scale Coefficients</h3>
        <p>Big-O notation describes the limiting behavior of a function when the argument tends towards infinity. It is the absolute tool for evaluating system efficiency. If your code uses nested loops causing O(N²) calculations, it will inevitably crash under production parameters.</p>
        <h3>2. The Halting Problem</h3>
        <p>Alan Turing mathematically proved that it is impossible to write a general algorithm that can determine whether any arbitrary program will finish running or run forever. This defines the absolute boundaries of what computers can calculate.</p>
        <h3>3. P vs NP Complexity</h3>
        <p>Can every problem whose solution can be quickly verified also be solved quickly? This remains the greatest open mystery in computer science. If P equals NP, global encryption breaks overnight.</p>
      `;
      audioText = "Big-O notation describes the limiting behavior of a function when the argument tends towards infinity. It is the absolute tool for evaluating system efficiency. Alan Turing mathematically proved that it is impossible to write a general algorithm that can determine whether any arbitrary program will finish running or run forever.";
    } else if (topic === 'blackhole' || topic.includes('singularity')) {
      title = "Singularity Horizons and Hawking Radiation Theory";
      content = `
        <h3>1. Event Horizon Mechanics</h3>
        <p>The event horizon is the boundary surrounding a black hole where the escape velocity exceeds the speed of light. Nothing, not even electromagnetic radiation, can escape its gravitational field once crossing this threshold.</p>
        <h3>2. Quantum Particle Splitting</h3>
        <p>Stephen Hawking proved that black holes are not completely black. Near the event horizon, virtual particle-antiparticle pairs constantly form. Occasionally, one falls in while the other escapes, resulting in Hawking Radiation and eventual black hole evaporation.</p>
        <h3>3. Information Paradox</h3>
        <p>If a black hole evaporates, what happens to the physical information of the matter that fell in? Quantum mechanics states information cannot be destroyed; relativity states it is lost. This remains a major theoretical conflict.</p>
      `;
      audioText = "The event horizon is the boundary surrounding a black hole where the escape velocity exceeds the speed of light. Stephen Hawking proved that black holes are not completely black. Near the event horizon, virtual particle-antiparticle pairs constantly form.";
    } else {
      title = "Quantum Superposition & Coherence Gate Decoupling";
      content = `
        <h3>1. Copenhagen vs Many-Worlds Paradigms</h3>
        <p>Quantum superposition dictates that a physical system exists in all theoretical states simultaneously until collapsed by measurement. Schrödinger's famous thought experiment was not a description of biology, but an illustration of the absurdity when quantum parameters are mapped to macroscopic realities.</p>
        <h3>2. Entanglement Entropy</h3>
        <p>When two particles are entangled, their quantum states are shared. Measuring particle A instantly defines the state of particle B, regardless of light-year distance. Einstein referred to this as 'spooky action at a distance'.</p>
        <h3>3. Quantum Cryptographic Gates</h3>
        <p>By using qubits that exist in state superpositions, algorithms like Shor's can factor prime integers exponentially faster than classical silicon registers. This will make all modern RSA encryption algorithms obsolete within years.</p>
      `;
      audioText = "Quantum superposition dictates that a physical system exists in all theoretical states simultaneously until collapsed by measurement. When two particles are entangled, their quantum states are shared. Measuring particle A instantly defines the state of particle B.";
    }

    return {
      title,
      topic: topic.toUpperCase(),
      level: level.toUpperCase(),
      duration,
      content,
      audioText
    };
  }

  private static simulateDebate(thesis: string): DebateResult {
    const t = thesis.toLowerCase();
    if (t.includes('mars') || t.includes('colonization')) {
      return {
        pro: [
          "Species redundancy: protects humanity against planetary-level extinction events.",
          "Catalyzes engineering innovations in life support, radiation shields, and resource reclamation.",
          "Serves as an inspirational unified goal for global scientific endeavors."
        ],
        con: [
          "Extreme capital ineffectiveness: conserving Earth's biosphere is thermodynamically 10,000x cheaper.",
          "Severe biological hazards: solar radiation and low gravity induce permanent muscle, bone, and DNA degradation.",
          "Atmospheric constraints: Mars' atmosphere is 99% carbon dioxide and lacks magnetosphere protection."
        ],
        conclusion: "Evaluating both paradigms yields a singular logical synthesis: Mars colonization is a highly logical long-term redundancy insurance policy, but attempts to deploy humans there before establishing automated, robotic closed-loop infrastructure represent a severe misallocation of terrestrial capital."
      };
    }

    return {
      pro: [
        "Offers potential efficiency optimization in classical operational models.",
        "Allows automation of redundant low-level processing units.",
        "Minimizes human typing and indexing error rates."
      ],
      con: [
        "Introduces severe edge-case vulnerabilities where AI models fail to parse data drift.",
        "High initial energy budget requirements to host computation models.",
        "Reduces adaptive human agency inside operational loops."
      ],
      conclusion: `The thesis, "${thesis}", presents a classic systemic trade-off. While optimization is high in narrow parameters, the system rigidity increases, resulting in lower resilience to unexpected variables.`
    };
  }
}
