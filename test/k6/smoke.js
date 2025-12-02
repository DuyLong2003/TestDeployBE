// import http from 'k6/http';
// import { check, sleep } from 'k6';

// export const options = {
//     vus: 1,
//     duration: '3s',
// };

// export default function () {
//     const res = http.get('http://localhost:8080/api/v1/tasks?current=1&pageSize=10');


//     // --- In cấu trúc JSON ra console ---
//     if (res.status === 200) {
//         try {
//             const body = res.json();
//             // Chỉ in log 1 lần đầu tiên
//             if (__VU === 1 && __ITER === 0) {
//                 console.log("=== JSON RESPONSE ===");
//                 console.log(JSON.stringify(body, null, 2));
//                 console.log("=====================");
//             }
//         } catch (e) {
//             console.error("Không parse được JSON");
//         }
//     }
//     // ------------------------------------------

//     check(res, {
//         'status là 200': (r) => r.status === 200,
//     });

//     sleep(1);
// }