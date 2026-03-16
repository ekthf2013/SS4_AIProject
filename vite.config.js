import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

// Path-finding and KnowledgeBase Plugin
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

        // Helper to run NLM Query
        const runNlmQuery = async (notebookId, question, sourceIds = null) => {
          let command = `nlm notebook query "${notebookId}" "${question.replace(/"/g, '\\"')}" --profile default --json`;
          if (sourceIds) command += ` --source-ids "${sourceIds}"`;
          
          const { stdout } = await execPromise(command);
          const parsed = JSON.parse(stdout);
          if (parsed && parsed.value && parsed.value.answer) {
            return parsed.value.answer;
          }
          throw new Error('Invalid NLM response');
        };

        // Chat Guide API
        if (req.url === '/api/chat-guide' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk.toString(); });
          req.on('end', async () => {
             res.setHeader('Content-Type', 'application/json');
             try {
                const { message, notebookUrl } = JSON.parse(body);
                const notebookId = notebookUrl.split('/').pop().split('?')[0];
                const answer = await runNlmQuery(notebookId, message);
                return res.end(JSON.stringify({ success: true, answer }));
             } catch (error) {
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
                const { notebookUrl, docTitle } = JSON.parse(body);
                const notebookId = notebookUrl.split('/').pop().split('?')[0];
                let prompt = `이 노트북의 내용을 바탕으로 전문가 수준의 4지선다형 객관식 시험 문제 최대 10개를 내줘. 포맷은 반드시 아래와 같은 JSON 배열만 출력해, 추가 설명 필요 없고 형식만 줘: [{"question": "문제", "options": ["보기1", "보기2", "보기3", "보기4"], "answer": 0}]`;
                
                if (docTitle) {
                   const cleanTitle = docTitle.replace(/\[.*?\]/g, '').replace(/\.(pdf|pptx|docx|txt)$/i, '').trim();
                   prompt = `노트북 소스 중 "${cleanTitle}" 관련 문서의 내용을 바탕으로 전문가 수준의 4지선다형 객관식 시험 문제 최대 10개를 내줘. 포맷은 반드시 아래와 같은 JSON 배열만 출력해, 추가 설명 필요 없고 형식만 줘: [{"question": "문제", "options": ["보기1", "보기2", "보기3", "보기4"], "answer": 0}]`;
                }

                const answer = await runNlmQuery(notebookId, prompt);
                const jsonMatch = answer.match(/\[[\s\S]*\]/);
                if(jsonMatch) {
                   return res.end(JSON.stringify({ success: true, data: JSON.parse(jsonMatch[0]) }));
                }
                return res.end(JSON.stringify({ success: false, error: 'Failed to parse quiz' }));
             } catch (error) {
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
                const { stdout } = await execPromise(`nlm source list "${notebookId}" --profile default --json`);
                return res.end(JSON.stringify({ success: true, data: JSON.parse(stdout) }));
             } catch (error) {
                return res.end(JSON.stringify({ success: false, error: error.message }));
             }
          });
          return;
        }

        // Summarize Doc API
        if (req.url === '/api/summarize-doc' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk.toString(); });
          req.on('end', async () => {
             res.setHeader('Content-Type', 'application/json');
             try {
                const { notebookUrl, docTitle } = JSON.parse(body);
                const notebookId = notebookUrl.split('/').pop().split('?')[0];
                const cleanTitle = docTitle.replace(/\[.*?\]/g, '').replace(/\.(pdf|pptx|docx|txt)$/i, '').trim();
                const prompt = `노트북 소스 중 "${cleanTitle}" 관련 문서의 핵심 내용을 찾아서 3~4줄 내외로 정중하게 요약해 줘.`;
                const answer = await runNlmQuery(notebookId, prompt);
                const cleanAnswer = answer
                   .replace(/\[\d[\d\s\-,]*\]/g, '') // Remove citations like [1], [1, 2], [1-3]
                   .replace(/\*\*/g, '') // Remove bold markers
                   .replace(/EXTREMELY IMPORTANT:[\s\S]*/g, '') // Remove system footer
                   .trim();
                return res.end(JSON.stringify({ success: true, answer: cleanAnswer }));
             } catch (error) {
                return res.end(JSON.stringify({ success: false, error: error.message }));
             }
          });
          return;
        }

        // Path Finding API (NLM Context Only)
        if (req.url === '/api/path-finding' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk.toString(); });
          req.on('end', async () => {
            res.setHeader('Content-Type', 'application/json');
            try {
              const { departure, destination } = JSON.parse(body);
              const notebookId = "de6dee15-ad68-486b-b9f3-80d6ab7d5def";
              const prompt = `사용자가 ${departure}에서 ${destination}으로 이동하려고 합니다. 사내 통근버스(1,500원) 및 무료 셔틀버스 노선도를 확인하여 가장 효율적인 경로 2가지를 제안해 주세요. 답변은 반드시 아래와 같은 JSON 배열 형식으로만 해주세요: [{"title": "경로명", "cost": 1500, "duration": "45분", "tags": ["추천"], "steps": ["단계1", "단계2"]}]`;

              const answer = await runNlmQuery(notebookId, prompt);
              const jsonMatch = answer.match(/\[\s*\{[\s\S]*\}\s*\]/);
              if (jsonMatch) {
                const routes = JSON.parse(jsonMatch[0].replace(/\[\d+\]/g, ''));
                return res.end(JSON.stringify({ success: true, answer: routes }));
              }
              return res.end(JSON.stringify({ success: true, answer: [{ title: "경로 분석 결과", cost: 0, duration: "확인 필요", tags: ["AI"], steps: [answer.replace(/\[\d+\]/g, '').trim()] }] }));
            } catch (error) {
              return res.end(JSON.stringify({ success: false, error: error.message }));
            }
          });
          return;
        }
        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), pathFindingPlugin()],
})
