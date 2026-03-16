import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

function pathFindingPlugin() {
  let restaurants = [
    { id: 1, name: '요미 카츠', cat: 'PREMIUM', dist: '0.4KM', rating: 4.8, addedBy: 'admin', desc: '최상급 등심과 안심을 사용한 프리미엄 수제 돈카츠 전문점.', reviews: [] },
    { id: 2, name: '화란', cat: 'TECH DINING', dist: '1.2KM', rating: 4.5, addedBy: 'manager', desc: '점심시간 효율을 극대화한 스마트 주문 시스템과 퓨전 아시안 퀴진.', reviews: [] }
  ];
  let nextId = 3;

  return {
    name: 'path-finding-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Restaurant API
        if (req.url === '/api/restaurants') {
          if (req.method === 'GET') {
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ success: true, data: restaurants }));
          }
          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', () => {
              try {
                const newRes = JSON.parse(body);
                newRes.id = nextId++;
                if(!newRes.reviews) newRes.reviews = [];
                restaurants.push(newRes);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, data: newRes }));
              } catch (e) {
                res.statusCode = 400;
                res.end(JSON.stringify({ success: false }));
              }
            });
            return;
          }
        }
        
        // Add Reviews
        const reviewMatch = req.url.match(/^\/api\/restaurants\/(\d+)\/reviews$/);
        if (reviewMatch && req.method === 'POST') {
          const id = parseInt(reviewMatch[1]);
          let body = '';
          req.on('data', chunk => { body += chunk.toString(); });
          req.on('end', () => {
            try {
              const review = JSON.parse(body);
              const rest = restaurants.find(r => r.id === id);
              if(rest) {
                rest.reviews.unshift(review);
                // recalc rating
                rest.rating = (rest.reviews.reduce((acc, cur) => acc + cur.rating, 0) / rest.reviews.length).toFixed(1);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, data: rest }));
              } else {
                res.statusCode = 404;
                res.end(JSON.stringify({ success: false }));
              }
            } catch (e) {
              res.statusCode = 400;
              res.end(JSON.stringify({ success: false }));
            }
          });
          return;
        }

        // Delete Restaurant
        if (req.url.startsWith('/api/restaurants/') && req.method === 'DELETE') {
          const id = parseInt(req.url.split('/')[3]);
          restaurants = restaurants.filter(r => r.id !== id);
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ success: true }));
        }

        // Chat Guide API
        if (req.url === '/api/chat-guide' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          req.on('end', async () => {
             res.setHeader('Content-Type', 'application/json');
             try {
                const { message, notebookUrl } = JSON.parse(body);
                const pyScript = 'C:\\Users\\User\\Desktop\\Test_Skiils\\skills\\notebooklm\\scripts\\ask_question.py';
                const command = `python -X utf8 "${pyScript}" --question "${message.replace(/"/g, '\\"')}" --notebook-url "${notebookUrl}"`;
                console.log(`Executing Chat Guide: ${command}`);

                const { stdout, stderr } = await execPromise(command, {
                   env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
                });

                if (stderr) {
                   console.error('Python Stderr:', stderr);
                }

                // Extracting just the answer parts
                const parts = stdout.split('============================================================');
                if (parts.length >= 3) {
                   return res.end(JSON.stringify({ success: true, answer: parts[2].trim() }));
                } else {
                   return res.end(JSON.stringify({ success: false, error: 'Unexpected output format: ' + stdout }));
                }

             } catch (error) {
                console.error('Exec error:', error);
                return res.end(JSON.stringify({ success: false, error: error.message }));
             }
          });
          return;
        }

         // Generate Exam API
        if (req.url === '/api/generate-exam' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk.toString(); });
          req.on('end', async () => {
             res.setHeader('Content-Type', 'application/json');
             try {
                const { notebookUrl } = JSON.parse(body);
                const pyScript = 'C:\\Users\\User\\Desktop\\Test_Skiils\\skills\\notebooklm\\scripts\\ask_question.py';
                const prompt = `이 노트북의 내용을 바탕으로 전문가 수준의 4지선다형 객관식 시험 문제 최대 10개를 내줘. 포맷은 반드시 아래와 같은 JSON 배열만 출력해, 추가 설명 필요 없고 형식만 줘: [{"question": "문제", "options": ["보기1", "보기2", "보기3", "보기4"], "answer": 0}]`;
                const command = `python -X utf8 "${pyScript}" --question "${prompt.replace(/"/g, '\\"')}" --notebook-url "${notebookUrl}"`;
                console.log(`Executing Generate Exam: python ask_question.py`);

                const { stdout, stderr } = await execPromise(command, {
                   env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
                   maxBuffer: 1024 * 1024 * 5 // 5MB limit
                });

                if (stderr) console.error('Python Stderr:', stderr);

                const parts = stdout.split('============================================================');
                if (parts.length >= 3) {
                   const answerText = parts[2].trim();
                   // Clean up footnote injected tags just in case
                   let cleanText = answerText.replace(/EXTREMELY IMPORTANT:[\s\S]*/, '');
                   
                   // Try to extract JSON array
                   const jsonMatch = cleanText.match(/\[[\s\S]*\]/);
                   if(jsonMatch) {
                      const parsed = JSON.parse(jsonMatch[0]);
                      return res.end(JSON.stringify({ success: true, data: parsed }));
                   } else {
                      return res.end(JSON.stringify({ success: false, error: 'Failed to extract JSON from answer: ' + cleanText }));
                   }
                } else {
                   return res.end(JSON.stringify({ success: false, error: 'Unexpected output format: ' + stdout }));
                }

             } catch (error) {
                console.error('Exec error:', error);
                return res.end(JSON.stringify({ success: false, error: error.message }));
             }
          });
          return;
        }

        // List Sources API
        if (req.url === '/api/list-sources' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk.toString(); });
          req.on('end', async () => {
             res.setHeader('Content-Type', 'application/json');
             try {
                const { notebookId } = JSON.parse(body);
                if(!notebookId) {
                   return res.end(JSON.stringify({ success: false, error: 'notebookId is required' }));
                }

                console.log(`Executing List Sources for notebook: ${notebookId}`);
                const command = `nlm source list ${notebookId}`;
                const { stdout, stderr } = await execPromise(command);

                if(stderr) {
                  console.error('NLM Stderr:', stderr);
                }

                const parsed = JSON.parse(stdout);
                return res.end(JSON.stringify({ success: true, data: parsed }));
             } catch (error) {
                console.error('Exec error:', error);
                return res.end(JSON.stringify({ success: false, error: error.message }));
             }
          });
          return;
        }

        // Path Finding API
        if (req.url === '/api/path-finding' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          req.on('end', async () => {
            try {
              const { departure, destination } = JSON.parse(body);
              const question = `출발지는 ${departure}이고 목적지는 ${destination}입니다. 통근 경로를 다음 형식으로 묶어서 답변해주세요.\n추천 노선 : [내용]\n탑승 시간 : [내용]\n탑승 위치 : [내용]\n(각주나 1 같은 숫자, 부가 설명은 절대 생략하고 딱 이 내용만 주세요)`;
              const safeQuestion = question.replace(/"/g, '\\"');
              const pyScript = 'C:\\Users\\User\\Desktop\\Test_Skiils\\skills\\notebooklm\\scripts\\ask_question.py';
              
              const { stdout, stderr } = await execPromise(`python -X utf8 "${pyScript}" --question "${safeQuestion}"`, {
                env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
              });
              
              let finalAnswer = stdout;
              const separator = '============================================================';
              const parts = stdout.split(separator);
              if (parts.length >= 4) {
                finalAnswer = parts[2].trim();
              } else {
                finalAnswer = stdout; // fallback
              }
              
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, answer: finalAnswer }));
            } catch (error) {
              console.error(error);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: String(error) }));
            }
          });
          return;
        }
        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    pathFindingPlugin(),
  ],
})
