// import http from 'k6/http';
// import { check, sleep } from 'k6';

// export const options = {
//     stages: [
//         { duration: '30s', target: 20 },
//         { duration: '1m', target: 50 },  // 50 User ảo
//         { duration: '30s', target: 0 },
//     ],
//     thresholds: {
//         // KPI: 95% request nhanh hơn 300ms
//         http_req_duration: ['p(95)<300'],
//         // KPI: Không có lỗi
//         http_req_failed: ['rate<0.01'],
//     },
// };

// export default function () {
//     const res = http.get('http://localhost:8080/api/v1/tasks?current=1&pageSize=20');

//     const success = check(res, {
//         'status 200': (r) => r.status === 200,
//     });

//     if (!success) {
//         console.error(`Lỗi: ${res.status}`);
//     }

//     sleep(Math.random() * 1 + 0.5);
// }