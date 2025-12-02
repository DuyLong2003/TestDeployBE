// import http from 'k6/http';
// import { check, sleep } from 'k6';
// import { Rate } from 'k6/metrics';

// // Định nghĩa Custom Metric để đo Hit Rate chính xác 100%
// const cacheHitRate = new Rate('cache_hit_rate');

// export const options = {
//     // Cấu hình 2 kịch bản chạy song song hoặc tuần tự
//     scenarios: {
//         // 1. Smoke Test: 5 VUs trong 30s (Test nhẹ)
//         smoke_test: {
//             executor: 'constant-vus',
//             vus: 5,
//             duration: '30s',
//             startTime: '0s', // Chạy ngay lập tức
//         },

//         // 2. Load Test: Ramping đến 50 VUs (Mô phỏng 50 RPS) trong 3 phút
//         load_test: {
//             executor: 'ramping-vus',
//             startVUs: 0,
//             stages: [
//                 { duration: '30s', target: 20 }, // Warm up
//                 { duration: '2m', target: 50 },  // Duy trì tải cao
//                 { duration: '30s', target: 0 },  // Cool down
//             ],
//             startTime: '30s', // Chạy sau khi smoke test xong
//         },
//     },

//     thresholds: {
//         // KPI chung cho cả 2 kịch bản
//         http_req_duration: ['p(95)<300'], // 95% request phải nhanh hơn 300ms
//         http_req_failed: ['rate==0'],     // Không được phép lỗi

//         // KPI riêng cho Cache: Phải Hit trên 60%
//         'cache_hit_rate': ['rate>=0.60'],
//     },
// };

// export default function () {
//     const res = http.get('http://localhost:8080/api/v1/tasks?current=1&pageSize=20');

//     const isSuccess = check(res, {
//         'status 200': (r) => r.status === 200,
//         // Kiểm tra Header trực quan
//         'Header X-Cache tồn tại': (r) => r.headers['X-Cache'] !== undefined,
//     });

//     if (!isSuccess) {
//         console.error(`Lỗi: ${res.status}`);
//     } else {
//         // LOGIC ĐẾM HIT/MISS CHUẨN XÁC
//         // Lấy giá trị Header thực tế server trả về
//         const cacheHeader = res.headers['X-Cache'];

//         // Nếu Header là HIT -> Tính là 1, ngược lại là 0
//         const isHit = cacheHeader === 'HIT';
//         cacheHitRate.add(isHit);
//     }

//     // Sleep để điều chỉnh RPS (khoảng 50 user * 1 req/s = 50 RPS)
//     sleep(1);
// }