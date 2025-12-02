// import http from 'k6/http';
// import { sleep, check } from 'k6';

// export const options = {
//     // Chạy 10 người dùng ảo cùng lúc
//     vus: 10,
//     // Mỗi người spam liên tục trong 10 giây
//     duration: '10s',
// };

// export default function () {
//     const url = 'http://localhost:8080/api/v1/mail-job/welcome';

//     // Tạo email ngẫu nhiên để log nhìn cho khác nhau
//     const randomId = Math.floor(Math.random() * 10000);
//     const payload = JSON.stringify({
//         email: `user${randomId}@test.com`,
//     });

//     const params = {
//         headers: {
//             'Content-Type': 'application/json',
//         },
//     };

//     // Bắn Request
//     const res = http.post(url, payload, params);

//     // Check xem API có nhận không
//     check(res, {
//         'status is 201': (r) => r.status === 201,
//     });

//     // Nghỉ cực ngắn (0.1s) để spam cho nhanh
//     sleep(0.1);
// }