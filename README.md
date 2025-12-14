# **Reddit Mastermind – Automated Content Calendar Generator**  
*A hybrid AI-powered planner for generating natural, human-like Reddit posts & replies*

## 📌 **Overview**

Reddit Mastermind is a fully automated content calendar generator designed to help brands, creators, and teams consistently publish Reddit posts that sound natural, human, and engaging.

For every week, the system generates:
- A main Reddit post  
- A realistic reply from a second persona  
- Natural tone matching  
- Human-like phrasing (short, medium, long variations)  
- Topic variety  
- Grammar-polished, non-repetitive text  
- Subreddit rotation  
- Multi-week generation (Generate Next Week)

This project was built to demonstrate:
- High-quality language generation  
- Planning algorithms  
- Edge-case handling  
- Persona realism  
- Clean UI and production-ready code structure  

---

## 🎯 **Goal**

The objective is to design a planning algorithm that can:
1. Convert company inputs + personas into meaningful Reddit content  
2. Generate posts and comments that sound human  
3. Maintain tone consistency  
4. Avoid repetition and awkward phrasing  
5. Output a full weekly content calendar  
6. Scale into subsequent weeks  

---

## 🧠 **How It Works (Algorithm Architecture)**

### **1. Input Layer**
The user provides:
- Company information  
- Value proposition  
- Ideal customer  
- Company tone  
- Personas (with voice, background, pain points)  
- Themes  
- Subreddits  
- Number of posts per week  

This shapes the entire linguistic output.

---

### **2. Topic Planning**
Themes are transformed into weekly-friendly topics using:
- Topic simplification  
- Dual-theme conversational rewriting  
- Advice/tips/challenges framing  
- Randomized but controlled variation  

---

### **3. Hybrid Generation Pipeline**
Posts are assembled using:
- Optional intro (30% chance)  
- Persona voice seeds  
- Reflection + struggle + insight blocks  
- Topic insertion at natural positions  
- Advice or relatable closings  

Not a template — but dynamic assembly.

---

### **4. Text Cleanup Pipeline**
All posts and comments pass through:
- Topic rewrite  
- Filler removal ("this part of it")  
- Grammar correction  
- Duplicate sentence removal  
- Tone smoothing  
- Persona voice balancing  
- Final punctuation cleanup  

Ensures natural, clean, human-sounding text.

---

### **5. Comment Generator**
A second persona replies using:
- Comment intros  
- Short/medium/long variations  
- Micro-reactions ("Same here.", "Following.")  
- Natural reply tone  
- No repetition  

---

### **6. Calendar Generator**
- Posts distributed Sunday → Saturday  
- Persona rotation  
- Subreddit rotation  
- Zero duplicates  
- "Generate Next Week" recalculates with new seeds  

---

## 🛠 **Tech Stack**

**Frontend:**  
- Next.js 16  
- React 19  
- TailwindCSS 4  

**Backend Logic:**  
- TypeScript  
- Custom hybrid generator  
- TopicTools, TextTools, HybridGenerator  

**Deployment:**  
- Vercel (recommended)  

**No external APIs used — fully free and deterministic.**

---

## 🚀 **Features**

- **Human-like Reddit posts** — Natural phrasing with persona-specific voice  
- **Realistic persona replies** — Second persona comments that feel authentic  
- **Short, medium, long variation** — Dynamic content length based on topic complexity  
- **Grammar-polished output** — Advanced text cleanup and correction  
- **Customizable tones & personas** — Support for casual, friendly, professional, analytical, formal  
- **Weekly calendar view** — Clean table layout with post/comment previews  
- **Next week regeneration** — Seamless multi-week planning  
- **Modern UI** — Clean, minimal SaaS dashboard design  

---

## 🧪 **Testing & Edge Cases**

The generator handles:
- **Repetition detection** — Prevents duplicate sentences and phrases  
- **Grammar correction** — Fixes verb agreement, awkward phrasing, punctuation  
- **Persona collision** — Ensures poster and commenter are always different  
- **Subreddit over-posting** — Prevents same subreddit on consecutive days  
- **Short-content overcorrection** — Enhances ultra-short comments naturally  
- **Topic rewriting** — Conversational topic simplification  
- **Multi-week output quality** — Consistent quality across weeks  
- **Empty field validation** — Comprehensive input validation  
- **Length mode selection** — Complex topics force longer posts  

---

## 📦 **Setup**

### **Prerequisites**
- Node.js 18+ (LTS recommended)
- npm or yarn package manager

### **Installation Steps**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd reddit-mastermind
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

5. **Build for production**
   ```bash
   npm run build
   npm start
   ```

### **Environment Variables**
No environment variables required. The application runs fully client-side with localStorage for data persistence.

---

## 🚢 **Deployment**

### **Vercel (Recommended)**

1. **Push your code to GitHub**
   ```bash
   git push origin main
   ```

2. **Import project to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings

3. **Deploy**
   - Click "Deploy"
   - Your app will be live in minutes

### **Alternative Deployment Options**
- **Netlify** — Similar to Vercel, supports Next.js
- **AWS Amplify** — For enterprise deployments
- **Docker** — Containerized deployment option

---

## 📁 **Project Structure**

```
reddit-mastermind/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── generateCalendar/
│   │   │       └── route.ts          # API endpoint
│   │   ├── calendar/
│   │   │   └── page.tsx              # Calendar view
│   │   ├── generate/
│   │   │   └── page.tsx              # Form input page
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Home (redirects to /generate)
│   │   └── globals.css               # Global styles
│   └── lib/
│       ├── ai/
│       │   └── seeds/                # JSON seed files
│       ├── models/
│       │   ├── types.ts              # TypeScript interfaces
│       │   └── index.ts
│       └── utils/
│           ├── calendarGenerator.ts  # Weekly calendar logic
│           ├── hybridGenerator.ts    # Core generation engine
│           ├── personaTone.ts        # Persona tone system
│           ├── postPatterns.ts       # Pattern templates
│           ├── textTools.ts          # Text cleanup utilities
│           └── topicTools.ts         # Topic processing
├── public/                            # Static assets
├── package.json
├── tsconfig.json
└── README.md
```

---

## 💡 **How to Use**

1. **Navigate to Generate Page**
   - The home page redirects to `/generate`
   - Fill in company information and details

2. **Add Personas**
   - Create at least 2 personas with unique voices
   - Each persona needs: name, background, voice style, pain points

3. **Configure Subreddits & Themes**
   - Add target subreddits (e.g., `r/productivity`)
   - Add content themes (e.g., `task management`, `productivity`)

4. **Set Posts Per Week**
   - Choose how many posts to generate (recommended: 5-10)
   - Posts will be distributed across the week

5. **Generate Calendar**
   - Click "Generate Calendar"
   - View the generated weekly plan

6. **Generate Next Week**
   - On the calendar page, click "Generate Next Week"
   - System automatically shifts to the following week

---

## 🎨 **UI Features**

- **Clean, modern design** — Minimal SaaS dashboard aesthetic
- **Responsive layout** — Works on mobile, tablet, and desktop
- **Loading states** — Smooth spinners and transitions
- **Error handling** — Clear error messages and validation
- **Card-based layout** — Easy-to-read post and comment previews
- **Table view** — Comprehensive weekly calendar overview

---

## 🔧 **Customization**

### **Adding New Persona Voices**
Edit `src/lib/utils/personaTone.ts` to add new voice styles and prefixes.

### **Extending Seed Libraries**
Add new seed files in `src/lib/ai/seeds/` and import them in `hybridGenerator.ts`.

### **Modifying Generation Patterns**
Update patterns in `src/lib/utils/postPatterns.ts` for different post structures.

---

## 📝 **Code Quality**

- **TypeScript** — Full type safety
- **ESLint** — Code linting configured
- **Clean architecture** — Separated concerns and utilities
- **Production-ready** — Optimized for deployment
- **No external dependencies** — Pure TypeScript implementation

---

## 🤝 **Contributing**

This is a demonstration project. For improvements or bug fixes:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 **License**

This project is open source and available for educational and commercial use.

---

## 👤 **Author**

Built as a demonstration of:
- Advanced text generation techniques
- Planning algorithms
- Production-ready Next.js applications
- Clean code architecture

---

## 🙏 **Acknowledgments**

- Next.js team for the excellent framework
- TailwindCSS for the utility-first CSS framework
- The Reddit community for inspiration on natural conversation patterns

---

**Happy content planning! 🚀**
