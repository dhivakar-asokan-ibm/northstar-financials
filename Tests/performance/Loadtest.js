import http from 'k6/http';
import { sleep } from 'k6';
import { check } from 'k6';
import { Rate } from 'k6/metrics';

export const options = {
  stages: [
    { target: 1, duration: '0' },
    { target: 2, duration: '3s' },
    { target: 3, duration: '3s' }
  ],
  gracefulRampDown: '3s',
  gracefulStop: '5s',
  thresholds: {
    'http_req_duration' : ['p(90)<10000'] // 90% of requests must complete below 10000 ms
  }
};

// export const errorRate = new Rate('errors');

export default function () {
    const BASE_URL = 'https://daso.apigw-aw-eu.webmethods.io/gateway/CarbonAPI/1/';
    const url = `${BASE_URL}/pet/1;
    const params = {
      headers: {
        'Accept': 'application/json',
      }
    };
    
    const res = http.get(url, params);

    check(res, {
      'HTTP 200': (r) => r.status == 200
    });
    //}) || errorRate.add(1);
	  sleep(1);;
}
