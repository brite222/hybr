import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { CURRICULUM } from "../data/curriculum";
import StudentSidebar from "../components/StudentSidebar";
import "../styles/module.css";
import "../styles/dashboard.css";
import "../styles/course-overview.css";
import alphaLogo from "../assets/images/alpha-loggo.png";

// ── Icons ──
const HamburgerIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);
const ArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);
const CheckCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#8DC540" stroke="white" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="9 12 11 14 15 9" />
  </svg>
);
const CircleEmptyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#BBB" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
  </svg>
);
const ClockSmallIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const ChevronDown = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
// ── Phase icons (large, white, for week card headers) ──
const PhaseIcons = {
  Onboarding: () => (
    <svg width="28" height="24" viewBox="0 0 39 35" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M33 22.5C31.6698 22.5013 30.3776 22.9437 29.3258 23.758C28.2739 24.5723 27.5219 25.7125 27.1875 27H9C7.4087 27 5.88258 26.3679 4.75736 25.2426C3.63214 24.1174 3 22.5913 3 21C3 19.4087 3.63214 17.8826 4.75736 16.7574C5.88258 15.6321 7.4087 15 9 15H27C28.9891 15 30.8968 14.2098 32.3033 12.8033C33.7098 11.3968 34.5 9.48912 34.5 7.5C34.5 5.51088 33.7098 3.60322 32.3033 2.1967C30.8968 0.790176 28.9891 0 27 0H9C8.60218 0 8.22064 0.158036 7.93934 0.43934C7.65804 0.720645 7.5 1.10218 7.5 1.5C7.5 1.89782 7.65804 2.27936 7.93934 2.56066C8.22064 2.84196 8.60218 3 9 3H27C28.1935 3 29.3381 3.47411 30.182 4.31802C31.0259 5.16193 31.5 6.30653 31.5 7.5C31.5 8.69347 31.0259 9.83807 30.182 10.682C29.3381 11.5259 28.1935 12 27 12H9C6.61305 12 4.32387 12.9482 2.63604 14.636C0.948212 16.3239 0 18.6131 0 21C0 23.3869 0.948212 25.6761 2.63604 27.364C4.32387 29.0518 6.61305 30 9 30H27.1875C27.468 31.0864 28.0476 32.0725 28.8603 32.8461C29.6731 33.6197 30.6865 34.1498 31.7855 34.3764C32.8844 34.603 34.0249 34.5168 35.0774 34.1278C36.1298 33.7387 37.0521 33.0623 37.7395 32.1754C38.4268 31.2885 38.8517 30.2267 38.9658 29.1104C39.08 27.9941 38.8788 26.8683 38.3852 25.8606C37.8916 24.8529 37.1254 24.0038 36.1734 23.4098C35.2215 22.8158 34.1221 22.5006 33 22.5ZM33 31.5C32.4067 31.5 31.8266 31.3241 31.3333 30.9944C30.8399 30.6648 30.4554 30.1962 30.2284 29.6481C30.0013 29.0999 29.9419 28.4967 30.0576 27.9147C30.1734 27.3328 30.4591 26.7982 30.8787 26.3787C31.2982 25.9591 31.8328 25.6734 32.4147 25.5576C32.9967 25.4419 33.5999 25.5013 34.1481 25.7284C34.6962 25.9554 35.1648 26.3399 35.4944 26.8333C35.8241 27.3266 36 27.9067 36 28.5C36 29.2956 35.6839 30.0587 35.1213 30.6213C34.5587 31.1839 33.7957 31.5 33 31.5Z" fill="white"/>
    </svg>
  ),
  Insight: () => (
    <svg width="26" height="26" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M38.6027 36.4802L29.2146 27.0939C31.9356 23.8271 33.2925 19.6371 33.0029 15.3953C32.7133 11.1536 30.7995 7.1868 27.6597 4.32014C24.5199 1.45348 20.3958 -0.0923304 16.1453 0.00426941C11.8948 0.100869 7.84512 1.83244 4.83878 4.83878C1.83244 7.84512 0.100869 11.8948 0.00426941 16.1453C-0.0923304 20.3958 1.45348 24.5199 4.32014 27.6597C7.1868 30.7995 11.1536 32.7133 15.3953 33.0029C19.6371 33.2925 23.8271 31.9356 27.0939 29.2146L36.4802 38.6027C36.6196 38.7421 36.785 38.8526 36.9671 38.928C37.1492 39.0035 37.3444 39.0423 37.5414 39.0423C37.7385 39.0423 37.9337 39.0035 38.1158 38.928C38.2979 38.8526 38.4633 38.7421 38.6027 38.6027C38.7421 38.4633 38.8526 38.2979 38.928 38.1158C39.0035 37.9337 39.0423 37.7385 39.0423 37.5414C39.0423 37.3444 39.0035 37.1492 38.928 36.9671C38.8526 36.785 38.7421 36.6196 38.6027 36.4802ZM3.04144 16.5414C3.04144 13.8714 3.83321 11.2613 5.3166 9.04125C6.8 6.82118 8.90841 5.09085 11.3752 4.06907C13.842 3.04729 16.5564 2.77994 19.1752 3.30084C21.7939 3.82174 24.1994 5.10749 26.0874 6.9955C27.9754 8.88351 29.2611 11.289 29.782 13.9077C30.3029 16.5265 30.0356 19.2409 29.0138 21.7077C27.992 24.1745 26.2617 26.2829 24.0416 27.7663C21.8216 29.2497 19.2115 30.0414 16.5414 30.0414C12.9622 30.0375 9.53077 28.6139 6.99989 26.083C4.46901 23.5521 3.04541 20.1206 3.04144 16.5414Z" fill="white"/>
    </svg>
  ),
  Innovation: () => (
    <svg width="28" height="28" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M36.0929 32.1506C37.9898 30.5573 39.5051 28.5587 40.5273 26.3022C41.5494 24.0456 42.0524 21.5886 41.9992 19.1119C41.8117 10.5412 34.9473 3.47437 26.3917 3.02437C24.1842 2.90422 21.9751 3.2289 19.8955 3.97914C17.816 4.72938 15.9084 5.88988 14.286 7.39171C12.6637 8.89353 11.3597 10.7061 10.4515 12.7217C9.54332 14.7373 9.04944 16.9148 8.99919 19.125L4.78982 27.2212C4.77294 27.255 4.75607 27.2887 4.74107 27.3225C4.43929 28.0259 4.41778 28.8181 4.68095 29.5368C4.94412 30.2555 5.47205 30.8465 6.15669 31.1887L6.20357 31.2094L10.4992 33.1762V39C10.4992 39.7956 10.8153 40.5587 11.3779 41.1213C11.9405 41.6839 12.7035 42 13.4992 42H22.4992C22.897 42 23.2785 41.842 23.5599 41.5607C23.8412 41.2794 23.9992 40.8978 23.9992 40.5C23.9992 40.1022 23.8412 39.7206 23.5599 39.4393C23.2785 39.158 22.897 39 22.4992 39H13.4992V32.2144C13.4994 31.9269 13.417 31.6453 13.2618 31.4033C13.1065 31.1613 12.885 30.969 12.6236 30.8494L7.49919 28.5L11.8248 20.1862C11.9376 19.975 11.9974 19.7395 11.9992 19.5C11.9988 16.4406 13.0375 13.4718 14.9452 11.0801C16.8528 8.68834 19.5163 7.01548 22.4992 6.33562V9.25875C21.4984 9.61259 20.6549 10.3089 20.1177 11.2245C19.5806 12.1401 19.3845 13.2161 19.564 14.2623C19.7435 15.3086 20.2871 16.2577 21.0987 16.9419C21.9103 17.6261 22.9377 18.0014 23.9992 18.0014C25.0607 18.0014 26.0881 17.6261 26.8997 16.9419C27.7113 16.2577 28.2549 15.3086 28.4344 14.2623C28.6139 13.2161 28.4178 12.1401 27.8806 11.2245C27.3435 10.3089 26.5 9.61259 25.4992 9.25875V6C25.7429 6 25.9867 6 26.2304 6.01875C28.8905 6.17112 31.4465 7.10439 33.5789 8.70185C35.7113 10.2993 37.3253 12.49 38.2192 15H34.4992C34.2791 14.9999 34.0618 15.0482 33.8625 15.1416C33.6632 15.2349 33.4869 15.3709 33.3461 15.54L28.5629 21.2812C27.5654 20.9095 26.4685 20.9026 25.4663 21.2616C24.4641 21.6207 23.6212 22.3225 23.0866 23.2431C22.552 24.1637 22.3602 25.2437 22.5451 26.2921C22.73 27.3405 23.2797 28.2897 24.097 28.9719C24.9142 29.6541 25.9464 30.0252 27.011 30.0198C28.0755 30.0143 29.1038 29.6325 29.9141 28.942C30.7243 28.2514 31.2642 27.2966 31.4383 26.2464C31.6124 25.1961 31.4095 24.1182 30.8654 23.2031L35.2023 18H38.9129C38.9579 18.39 38.9854 18.7837 38.9954 19.1812C39.0422 21.3297 38.5772 23.4585 37.639 25.3918C36.7007 27.3251 35.316 29.0074 33.5992 30.3C33.3877 30.4586 33.2218 30.6703 33.1184 30.9136C33.015 31.1569 32.9778 31.4233 33.0104 31.6856L34.5104 43.6856C34.5561 44.0479 34.7323 44.381 35.006 44.6227C35.2797 44.8643 35.6322 44.9978 35.9973 44.9981C36.06 44.9981 36.1226 44.9944 36.1848 44.9869C36.3803 44.9625 36.5691 44.8999 36.7405 44.8026C36.9118 44.7053 37.0622 44.5751 37.1832 44.4196C37.3043 44.2642 37.3935 44.0863 37.4457 43.8964C37.498 43.7064 37.5124 43.508 37.4879 43.3125L36.0929 32.1506ZM23.9992 15C23.7025 15 23.4125 14.912 23.1658 14.7472C22.9192 14.5824 22.7269 14.3481 22.6134 14.074C22.4998 13.7999 22.4701 13.4983 22.528 13.2074C22.5859 12.9164 22.7288 12.6491 22.9385 12.4393C23.1483 12.2296 23.4156 12.0867 23.7066 12.0288C23.9975 11.9709 24.2991 12.0006 24.5732 12.1142C24.8473 12.2277 25.0816 12.42 25.2464 12.6666C25.4112 12.9133 25.4992 13.2033 25.4992 13.5C25.4992 13.8978 25.3412 14.2794 25.0599 14.5607C24.7786 14.842 24.397 15 23.9992 15ZM26.9992 27C26.7025 27 26.4125 26.912 26.1658 26.7472C25.9192 26.5824 25.7269 26.3481 25.6134 26.074C25.4998 25.7999 25.4701 25.4983 25.528 25.2074C25.5859 24.9164 25.7288 24.6491 25.9385 24.4393C26.1483 24.2296 26.4156 24.0867 26.7066 24.0288C26.9975 23.9709 27.2991 24.0006 27.5732 24.1142C27.8473 24.2277 28.0816 24.42 28.2464 24.6666C28.4112 24.9133 28.4992 25.2033 28.4992 25.5C28.4992 25.8978 28.3412 26.2794 28.0599 26.5607C27.7786 26.842 27.397 27 26.9992 27Z" fill="white"/>
    </svg>
  ),
  Discovery: () => (
    <svg width="26" height="26" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M38.6027 36.4802L29.2146 27.0939C31.9356 23.8271 33.2925 19.6371 33.0029 15.3953C32.7133 11.1536 30.7995 7.1868 27.6597 4.32014C24.5199 1.45348 20.3958 -0.0923304 16.1453 0.00426941C11.8948 0.100869 7.84512 1.83244 4.83878 4.83878C1.83244 7.84512 0.100869 11.8948 0.00426941 16.1453C-0.0923304 20.3958 1.45348 24.5199 4.32014 27.6597C7.1868 30.7995 11.1536 32.7133 15.3953 33.0029C19.6371 33.2925 23.8271 31.9356 27.0939 29.2146L36.4802 38.6027C36.6196 38.7421 36.785 38.8526 36.9671 38.928C37.1492 39.0035 37.3444 39.0423 37.5414 39.0423C37.7385 39.0423 37.9337 39.0035 38.1158 38.928C38.2979 38.8526 38.4633 38.7421 38.6027 38.6027C38.7421 38.4633 38.8526 38.2979 38.928 38.1158C39.0035 37.9337 39.0423 37.7385 39.0423 37.5414C39.0423 37.3444 39.0035 37.1492 38.928 36.9671C38.8526 36.785 38.7421 36.6196 38.6027 36.4802ZM3.04144 16.5414C3.04144 13.8714 3.83321 11.2613 5.3166 9.04125C6.8 6.82118 8.90841 5.09085 11.3752 4.06907C13.842 3.04729 16.5564 2.77994 19.1752 3.30084C21.7939 3.82174 24.1994 5.10749 26.0874 6.9955C27.9754 8.88351 29.2611 11.289 29.782 13.9077C30.3029 16.5265 30.0356 19.2409 29.0138 21.7077C27.992 24.1745 26.2617 26.2829 24.0416 27.7663C21.8216 29.2497 19.2115 30.0414 16.5414 30.0414C12.9622 30.0375 9.53077 28.6139 6.99989 26.083C4.46901 23.5521 3.04541 20.1206 3.04144 16.5414Z" fill="white"/>
    </svg>
  ),
  Ideation: () => (
    <svg width="28" height="28" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M36.0929 32.1506C37.9898 30.5573 39.5051 28.5587 40.5273 26.3022C41.5494 24.0456 42.0524 21.5886 41.9992 19.1119C41.8117 10.5412 34.9473 3.47437 26.3917 3.02437C24.1842 2.90422 21.9751 3.2289 19.8955 3.97914C17.816 4.72938 15.9084 5.88988 14.286 7.39171C12.6637 8.89353 11.3597 10.7061 10.4515 12.7217C9.54332 14.7373 9.04944 16.9148 8.99919 19.125L4.78982 27.2212C4.77294 27.255 4.75607 27.2887 4.74107 27.3225C4.43929 28.0259 4.41778 28.8181 4.68095 29.5368C4.94412 30.2555 5.47205 30.8465 6.15669 31.1887L6.20357 31.2094L10.4992 33.1762V39C10.4992 39.7956 10.8153 40.5587 11.3779 41.1213C11.9405 41.6839 12.7035 42 13.4992 42H22.4992C22.897 42 23.2785 41.842 23.5599 41.5607C23.8412 41.2794 23.9992 40.8978 23.9992 40.5C23.9992 40.1022 23.8412 39.7206 23.5599 39.4393C23.2785 39.158 22.897 39 22.4992 39H13.4992V32.2144C13.4994 31.9269 13.417 31.6453 13.2618 31.4033C13.1065 31.1613 12.885 30.969 12.6236 30.8494L7.49919 28.5L11.8248 20.1862C11.9376 19.975 11.9974 19.7395 11.9992 19.5C11.9988 16.4406 13.0375 13.4718 14.9452 11.0801C16.8528 8.68834 19.5163 7.01548 22.4992 6.33562V9.25875C21.4984 9.61259 20.6549 10.3089 20.1177 11.2245C19.5806 12.1401 19.3845 13.2161 19.564 14.2623C19.7435 15.3086 20.2871 16.2577 21.0987 16.9419C21.9103 17.6261 22.9377 18.0014 23.9992 18.0014C25.0607 18.0014 26.0881 17.6261 26.8997 16.9419C27.7113 16.2577 28.2549 15.3086 28.4344 14.2623C28.6139 13.2161 28.4178 12.1401 27.8806 11.2245C27.3435 10.3089 26.5 9.61259 25.4992 9.25875V6C25.7429 6 25.9867 6 26.2304 6.01875C28.8905 6.17112 31.4465 7.10439 33.5789 8.70185C35.7113 10.2993 37.3253 12.49 38.2192 15H34.4992C34.2791 14.9999 34.0618 15.0482 33.8625 15.1416C33.6632 15.2349 33.4869 15.3709 33.3461 15.54L28.5629 21.2812C27.5654 20.9095 26.4685 20.9026 25.4663 21.2616C24.4641 21.6207 23.6212 22.3225 23.0866 23.2431C22.552 24.1637 22.3602 25.2437 22.5451 26.2921C22.73 27.3405 23.2797 28.2897 24.097 28.9719C24.9142 29.6541 25.9464 30.0252 27.011 30.0198C28.0755 30.0143 29.1038 29.6325 29.9141 28.942C30.7243 28.2514 31.2642 27.2966 31.4383 26.2464C31.6124 25.1961 31.4095 24.1182 30.8654 23.2031L35.2023 18H38.9129C38.9579 18.39 38.9854 18.7837 38.9954 19.1812C39.0422 21.3297 38.5772 23.4585 37.639 25.3918C36.7007 27.3251 35.316 29.0074 33.5992 30.3C33.3877 30.4586 33.2218 30.6703 33.1184 30.9136C33.015 31.1569 32.9778 31.4233 33.0104 31.6856L34.5104 43.6856C34.5561 44.0479 34.7323 44.381 35.006 44.6227C35.2797 44.8643 35.6322 44.9978 35.9973 44.9981C36.06 44.9981 36.1226 44.9944 36.1848 44.9869C36.3803 44.9625 36.5691 44.8999 36.7405 44.8026C36.9118 44.7053 37.0622 44.5751 37.1832 44.4196C37.3043 44.2642 37.3935 44.0863 37.4457 43.8964C37.498 43.7064 37.5124 43.508 37.4879 43.3125L36.0929 32.1506Z" fill="white"/>
    </svg>
  ),
  Prototyping: () => (
    <svg width="28" height="28" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M36.0929 32.1506C37.9898 30.5573 39.5051 28.5587 40.5273 26.3022C41.5494 24.0456 42.0524 21.5886 41.9992 19.1119C41.8117 10.5412 34.9473 3.47437 26.3917 3.02437C24.1842 2.90422 21.9751 3.2289 19.8955 3.97914C17.816 4.72938 15.9084 5.88988 14.286 7.39171C12.6637 8.89353 11.3597 10.7061 10.4515 12.7217C9.54332 14.7373 9.04944 16.9148 8.99919 19.125L4.78982 27.2212C4.77294 27.255 4.75607 27.2887 4.74107 27.3225C4.43929 28.0259 4.41778 28.8181 4.68095 29.5368C4.94412 30.2555 5.47205 30.8465 6.15669 31.1887L6.20357 31.2094L10.4992 33.1762V39C10.4992 39.7956 10.8153 40.5587 11.3779 41.1213C11.9405 41.6839 12.7035 42 13.4992 42H22.4992C22.897 42 23.2785 41.842 23.5599 41.5607C23.8412 41.2794 23.9992 40.8978 23.9992 40.5C23.9992 40.1022 23.8412 39.7206 23.5599 39.4393C23.2785 39.158 22.897 39 22.4992 39H13.4992V32.2144C13.4994 31.9269 13.417 31.6453 13.2618 31.4033C13.1065 31.1613 12.885 30.969 12.6236 30.8494L7.49919 28.5L11.8248 20.1862C11.9376 19.975 11.9974 19.7395 11.9992 19.5C11.9988 16.4406 13.0375 13.4718 14.9452 11.0801C16.8528 8.68834 19.5163 7.01548 22.4992 6.33562V9.25875C21.4984 9.61259 20.6549 10.3089 20.1177 11.2245C19.5806 12.1401 19.3845 13.2161 19.564 14.2623C19.7435 15.3086 20.2871 16.2577 21.0987 16.9419C21.9103 17.6261 22.9377 18.0014 23.9992 18.0014C25.0607 18.0014 26.0881 17.6261 26.8997 16.9419C27.7113 16.2577 28.2549 15.3086 28.4344 14.2623C28.6139 13.2161 28.4178 12.1401 27.8806 11.2245C27.3435 10.3089 26.5 9.61259 25.4992 9.25875V6Z" fill="white"/>
    </svg>
  ),
  Demo: () => (
    <svg width="26" height="26" viewBox="0 0 41 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3.00142 6C3.00142 5.60218 3.15946 5.22064 3.44076 4.93934C3.72207 4.65804 4.1036 4.5 4.50142 4.5H7.50142V1.5C7.50142 1.10218 7.65946 0.720645 7.94076 0.43934C8.22207 0.158036 8.6036 0 9.00142 0C9.39925 0 9.78078 0.158036 10.0621 0.43934C10.3434 0.720645 10.5014 1.10218 10.5014 1.5V4.5H13.5014C13.8992 4.5 14.2808 4.65804 14.5621 4.93934C14.8434 5.22064 15.0014 5.60218 15.0014 6C15.0014 6.39782 14.8434 6.77936 14.5621 7.06066C14.2808 7.34196 13.8992 7.5 13.5014 7.5H10.5014V10.5C10.5014 10.8978 10.3434 11.2794 10.0621 11.5607C9.78078 11.842 9.39925 12 9.00142 12C8.6036 12 8.22207 11.842 7.94076 11.5607C7.65946 11.2794 7.50142 10.8978 7.50142 10.5V7.5H4.50142C4.1036 7.5 3.72207 7.34196 3.44076 7.06066C3.15946 6.77936 3.00142 6.39782 3.00142 6ZM28.5014 30H27.0014V28.5C27.0014 28.1022 26.8434 27.7206 26.5621 27.4393C26.2808 27.158 25.8992 27 25.5014 27C25.1036 27 24.7221 27.158 24.4408 27.4393C24.1595 27.7206 24.0014 28.1022 24.0014 28.5V30H22.5014C22.1036 30 21.7221 30.158 21.4408 30.4393C21.1595 30.7206 21.0014 31.1022 21.0014 31.5C21.0014 31.8978 21.1595 32.2794 21.4408 32.5607C21.7221 32.842 22.1036 33 22.5014 33H24.0014V34.5C24.0014 34.8978 24.1595 35.2794 24.4408 35.5607C24.7221 35.842 25.1036 36 25.5014 36C25.8992 36 26.2808 35.842 26.5621 35.5607C26.8434 35.2794 27.0014 34.8978 27.0014 34.5V33H28.5014C28.8992 33 29.2808 32.842 29.5621 32.5607C29.8434 32.2794 30.0014 31.8978 30.0014 31.5C30.0014 31.1022 29.8434 30.7206 29.5621 30.4393C29.2808 30.158 28.8992 30 28.5014 30ZM39.0014 21H36.0014V18C36.0014 17.6022 35.8434 17.2206 35.5621 16.9393C35.2808 16.658 34.8992 16.5 34.5014 16.5C34.1036 16.5 33.7221 16.658 33.4408 16.9393C33.1595 17.2206 33.0014 17.6022 33.0014 18V21H30.0014C29.6036 21 29.2221 21.158 28.9408 21.4393C28.6595 21.7206 28.5014 22.1022 28.5014 22.5C28.5014 22.8978 28.6595 23.2794 28.9408 23.5607C29.2221 23.842 29.6036 24 30.0014 24H33.0014V27C33.0014 27.3978 33.1595 27.7794 33.4408 28.0607C33.7221 28.342 34.1036 28.5 34.5014 28.5C34.8992 28.5 35.2808 28.342 35.5621 28.0607C35.8434 27.7794 36.0014 27.3978 36.0014 27V24H39.0014C39.3992 24 39.7808 23.842 40.0621 23.5607C40.3434 23.2794 40.5014 22.8978 40.5014 22.5C40.5014 22.1022 40.3434 21.7206 40.0621 21.4393C39.7808 21.158 39.3992 21 39.0014 21Z" fill="white"/>
    </svg>
  ),
};

// ── Lesson type icons (blue, small, in lesson rows) ──
const LessonTypeIcons = {
  module: () => (
    <svg width="18" height="18" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M27 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V25C3 25.5304 3.21071 26.0391 3.58579 26.4142C3.96086 26.7893 4.46957 27 5 27H6.67375C6.86301 27.0001 7.0484 26.9464 7.20838 26.8453C7.36836 26.7442 7.49636 26.5997 7.5775 26.4287C8.06377 25.4021 8.83151 24.5346 9.79143 23.9271C10.7514 23.3196 11.864 22.9971 13 22.9971C14.136 22.9971 15.2486 23.3196 16.2086 23.9271C17.1685 24.5346 17.9362 25.4021 18.4225 26.4287C18.5036 26.5997 18.6316 26.7442 18.7916 26.8453C18.9516 26.9464 19.137 27.0001 19.3263 27H27C27.5304 27 28.0391 26.7893 28.4142 26.4142C28.7893 26.0391 29 25.5304 29 25V7C29 6.46957 28.7893 5.96086 28.4142 5.58579C28.0391 5.21071 27.5304 5 27 5ZM10 18C10 17.4067 10.1759 16.8266 10.5056 16.3333C10.8352 15.8399 11.3038 15.4554 11.8519 15.2284C12.4001 15.0013 13.0033 14.9419 13.5853 15.0576C14.1672 15.1734 14.7018 15.4591 15.1213 15.8787C15.5409 16.2982 15.8266 16.8328 15.9424 17.4147C16.0581 17.9967 15.9987 18.5999 15.7716 19.1481C15.5446 19.6962 15.1601 20.1648 14.6667 20.4944C14.1734 20.8241 13.5933 21 13 21C12.2044 21 11.4413 20.6839 10.8787 20.1213C10.3161 19.5587 10 18.7956 10 18Z" fill="#196AB4"/>
    </svg>
  ),
  video: () => (
    <svg width="18" height="18" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M31.4713 9.125C31.3118 9.03953 31.1321 8.99892 30.9514 9.0075C30.7707 9.01609 30.5956 9.07354 30.445 9.17375L26 12.1313V9C26 8.46957 25.7893 7.96086 25.4142 7.58579C25.0391 7.21071 24.5304 7 24 7H4C3.46957 7 2.96086 7.21071 2.58579 7.58579C2.21071 7.96086 2 8.46957 2 9V23C2 23.5304 2.21071 24.0391 2.58579 24.4142C2.96086 24.7893 3.46957 25 4 25H24C24.5304 25 25.0391 24.7893 25.4142 24.4142C25.7893 24.0391 26 23.5304 26 23V19.875L30.445 22.8388C30.6101 22.946 30.8032 23.002 31 23C31.2652 23 31.5196 22.8946 31.7071 22.7071C31.8946 22.5196 32 22.2652 32 22V10C31.9987 9.82007 31.949 9.64382 31.8559 9.48982C31.7628 9.33582 31.63 9.20979 31.4713 9.125Z" fill="#196AB4"/>
    </svg>
  ),
  audio: () => (
    <svg width="18" height="18" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M26.7075 10.2925L19.7075 3.2925C19.6146 3.19967 19.5042 3.12605 19.3829 3.07586C19.2615 3.02568 19.1314 2.9999 19 3H7C6.46957 3 5.96086 3.21071 5.58579 3.58579C5.21071 3.96086 5 4.46957 5 5V27C5 27.5304 5.21071 28.0391 5.58579 28.4142C5.96086 28.7893 6.46957 29 7 29H25C25.5304 29 26.0391 28.7893 26.4142 28.4142C26.7893 28.0391 27 27.5304 27 27V11C27.0001 10.8686 26.9743 10.7385 26.9241 10.6172C26.8739 10.4958 26.8003 10.3854 26.7075 10.2925Z" fill="#196AB4"/>
    </svg>
  ),
  download: () => (
    <svg width="18" height="18" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M26.7075 10.2925L19.7075 3.2925C19.6146 3.19967 19.5042 3.12605 19.3829 3.07586C19.2615 3.02568 19.1314 2.9999 19 3H7C6.46957 3 5.96086 3.21071 5.58579 3.58579C5.21071 3.96086 5 4.46957 5 5V27C5 27.5304 5.21071 28.0391 5.58579 28.4142C5.96086 28.7893 6.46957 29 7 29H25C25.5304 29 26.0391 28.7893 26.4142 28.4142C26.7893 28.0391 27 27.5304 27 27V11C27.0001 10.8686 26.9743 10.7385 26.9241 10.6172C26.8739 10.4958 26.8003 10.3854 26.7075 10.2925ZM20 6.41375L23.5863 10H20V6.41375ZM19.7075 19.2925C19.8005 19.3854 19.8742 19.4957 19.9246 19.6171C19.9749 19.7385 20.0008 19.8686 20.0008 20C20.0008 20.1314 19.9749 20.2615 19.9246 20.3829C19.8742 20.5043 19.8005 20.6146 19.7075 20.7075L16.7075 23.7075C16.6146 23.8005 16.5043 23.8742 16.3829 23.9246C16.2615 23.9749 16.1314 24.0008 16 24.0008C15.8686 24.0008 15.7385 23.9749 15.6171 23.9246C15.4957 23.8742 15.3854 23.8005 15.2925 23.7075L12.2925 20.7075C12.1049 20.5199 11.9994 20.2654 11.9994 20C11.9994 19.7346 12.1049 19.4801 12.2925 19.2925C12.4801 19.1049 12.7346 18.9994 13 18.9994C13.2654 18.9994 13.5199 19.1049 13.7075 19.2925L15 20.5863V15C15 14.7348 15.1054 14.4804 15.2929 14.2929C15.4804 14.1054 15.7348 14 16 14C16.2652 14 16.5196 14.1054 16.7071 14.2929C16.8946 14.4804 17 14.7348 17 15V20.5863L18.2925 19.2925Z" fill="#196AB4"/>
    </svg>
  ),
  quiz: () => (
    <svg width="18" height="18" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M28.7075 7.29249L24.7075 3.29249C24.6146 3.19952 24.5043 3.12576 24.3829 3.07543C24.2615 3.02511 24.1314 2.99921 24 2.99921C23.8686 2.99921 23.7385 3.02511 23.6171 3.07543C23.4957 3.12576 23.3854 3.19952 23.2925 3.29249L11.2925 15.2925C11.1997 15.3854 11.1261 15.4957 11.0759 15.6171C11.0257 15.7385 10.9999 15.8686 11 16V20C11 20.2652 11.1054 20.5196 11.2929 20.7071C11.4804 20.8946 11.7348 21 12 21H16C16.1314 21.0001 16.2615 20.9743 16.3829 20.9241C16.5042 20.8739 16.6146 20.8003 16.7075 20.7075L28.7075 8.70749C28.8005 8.61462 28.8742 8.50433 28.9246 8.38293C28.9749 8.26154 29.0008 8.13141 29.0008 7.99999C29.0008 7.86858 28.9749 7.73845 28.9246 7.61705C28.8742 7.49566 28.8005 7.38537 28.7075 7.29249ZM28 16V26C28 26.5304 27.7893 27.0391 27.4142 27.4142C27.0391 27.7893 26.5304 28 26 28H6C5.46957 28 4.96086 27.7893 4.58579 27.4142C4.21071 27.0391 4 26.5304 4 26V5.99999C4 5.46956 4.21071 4.96085 4.58579 4.58578C4.96086 4.21071 5.46957 3.99999 6 3.99999H16C16.2652 3.99999 16.5196 4.10535 16.7071 4.29289C16.8946 4.48042 17 4.73478 17 4.99999C17 5.26521 16.8946 5.51956 16.7071 5.7071C16.5196 5.89464 16.2652 5.99999 16 5.99999H6V26H26V16C26 15.7348 26.1054 15.4804 26.2929 15.2929C26.4804 15.1054 26.7348 15 27 15C27.2652 15 27.5196 15.1054 27.7071 15.2929C27.8946 15.4804 28 15.7348 28 16Z" fill="#196AB4"/>
    </svg>
  ),
  upload: () => (
    <svg width="18" height="18" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: "rotate(180deg)" }}>
      <path d="M26.7075 10.2925L19.7075 3.2925C19.6146 3.19967 19.5042 3.12605 19.3829 3.07586C19.2615 3.02568 19.1314 2.9999 19 3H7C6.46957 3 5.96086 3.21071 5.58579 3.58579C5.21071 3.96086 5 4.46957 5 5V27C5 27.5304 5.21071 28.0391 5.58579 28.4142C5.96086 28.7893 6.46957 29 7 29H25C25.5304 29 26.0391 28.7893 26.4142 28.4142C26.7893 28.0391 27 27.5304 27 27V11C27.0001 10.8686 26.9743 10.7385 26.9241 10.6172C26.8739 10.4958 26.8003 10.3854 26.7075 10.2925Z" fill="#196AB4"/>
    </svg>
  ),
  image: () => (
    <svg width="18" height="18" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="5" width="26" height="22" rx="2" stroke="#196AB4" strokeWidth="2.5" fill="none" />
      <circle cx="10" cy="12" r="2" fill="#196AB4" />
      <path d="M3 22 L11 14 L17 20 L23 14 L29 20" stroke="#196AB4" strokeWidth="2.5" fill="none" />
    </svg>
  ),
  info: () => (
    <svg width="18" height="18" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="13" stroke="#196AB4" strokeWidth="2.5" fill="none" />
      <line x1="16" y1="11" x2="16" y2="11" stroke="#196AB4" strokeWidth="3" strokeLinecap="round" />
      <line x1="16" y1="15" x2="16" y2="22" stroke="#196AB4" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
  feedback: () => (
    <svg width="18" height="18" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M27 5H5C3.9 5 3 5.9 3 7V21C3 22.1 3.9 23 5 23H9V28L14 23H27C28.1 23 29 22.1 29 21V7C29 5.9 28.1 5 27 5Z" stroke="#196AB4" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
    </svg>
  ),
};

// ── Progress Ring ──
function ProgressRing({ percent, size = 70, strokeWidth = 7, dark = false }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  const color = "#8DC540";
  const trackColor = dark ? "rgba(255,255,255,0.2)" : "#E5E5E5";

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={trackColor} strokeWidth={strokeWidth} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={strokeWidth} fill="none"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.6s ease" }} />
      </svg>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "Montserrat, sans-serif", fontWeight: 700,
        fontSize: 14, color: dark ? "#fff" : "#000",
      }}>
        {percent}%
      </div>
    </div>
  );
}

// ── Status pill ──
const Pill = ({ done }) => (
  <span style={{
    padding: "5px 12px", borderRadius: 4,
    background: done ? "#8DC540" : "#D5D5D5",
    color: done ? "#fff" : "#666",
    fontSize: 10, fontWeight: 700, letterSpacing: 1.2,
    textTransform: "uppercase", fontFamily: "Montserrat, sans-serif",
    whiteSpace: "nowrap", minWidth: 90, textAlign: "center", display: "inline-block",
  }}>
    {done ? "COMPLETED" : "NOT STARTED"}
  </span>
);

export default function CourseOverviewPage() {
  const navigate = useNavigate();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedWeeks, setExpandedWeeks] = useState({});

  useEffect(() => {
    api.get("/program")
      .then(res => {
        setProgram(res.data);
        // Auto-expand the current week
        if (res.data?.currentWeek) {
          setExpandedWeeks({ [res.data.currentWeek]: true });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleWeek = (weekNum) => {
    setExpandedWeeks(prev => ({ ...prev, [weekNum]: !prev[weekNum] }));
  };

  const currentWeek = program?.currentWeek || 1;
  const currentWeekData = CURRICULUM[currentWeek];

  // Top progress bar
  const currentWeekFromProgram = program?.weeks?.find(w => w.weekNumber === currentWeek);
  const currentWeekCompletedCount = currentWeekFromProgram?.completedCount || 0;
  const currentWeekTotalLessons = currentWeekData?.lessons?.length || 0;
  const topProgress = currentWeekTotalLessons > 0
    ? Math.round((currentWeekCompletedCount / currentWeekTotalLessons) * 100) : 0;

  // Build all weeks with status
// Build all weeks with status
const allWeeks = Object.values(CURRICULUM).map(week => {
  const weekFromProgram = program?.weeks?.find(w => w.weekNumber === week.weekNumber);
  const completedIds = weekFromProgram?.completedLessonIds || [];
  const totalLessons = week.lessons.length;
  const completedCount = completedIds.length;
  const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const isUnlocked = weekFromProgram?.isUnlocked || false;
  const isCurrent = week.weekNumber === currentWeek;
  const isCompleted = isUnlocked && completedCount === totalLessons;
  const isPast = isUnlocked && !isCurrent;

  return { ...week, completedIds, progress, isUnlocked, isCurrent, isCompleted, isPast };
}).sort((a, b) => {
  // Current week always first
  if (a.isCurrent) return -1;
  if (b.isCurrent) return 1;
  // Everything else stays in natural week order (1, 2, 3...)
  return a.weekNumber - b.weekNumber;
});

  return (
    <div className="module-page">
      <div className="mobile-top-header">
       <div className="mobile-top-header-logo">
  <img src={alphaLogo} alt="ALPHA by HYBR" className="mobile-top-header-logo-img" />
</div>
        <button className="mobile-hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
          <HamburgerIcon />
        </button>
      </div>
      <div className={`mobile-overlay ${mobileMenuOpen ? "open" : ""}`} onClick={() => setMobileMenuOpen(false)} />
      <StudentSidebar open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <main className="module-main">
        {/* Top progress bar */}
        <div className="module-topbar">
          <div className="module-topbar-label">
            <span className="topbar-title">WEEK {currentWeek}</span>
            <span className="topbar-dot">•</span>
            <span className="topbar-subtitle">{currentWeekData?.title?.toUpperCase() || ""} PHASE</span>
          </div>
          <div className="module-progress">
            <div className="module-progress-bar">
              <div className="module-progress-fill" style={{ width: `${topProgress}%` }} />
            </div>
            <span className="module-progress-text">{topProgress}%</span>
          </div>
        </div>

        {/* Back button */}
        <button
          onClick={() => navigate("/my-courses")}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "transparent", border: "none", color: "#196AB4",
            cursor: "pointer", fontSize: 14, fontFamily: "Montserrat, sans-serif",
            fontWeight: 500, padding: 0, marginBottom: 8, alignSelf: "flex-start",
          }}
        >
          <ArrowLeft /> Back to My Courses
        </button>

       {loading ? (
  <div style={{ padding: 80, textAlign: "center", color: "#666" }}>Loading...</div>
) : (
  allWeeks.map(week => {
    const PhaseIcon = PhaseIcons[week.title] || PhaseIcons.Innovation;
    const isExpanded = expandedWeeks[week.weekNumber];

    // ── CURRENT WEEK CARD (white, collapsible) ──
    if (week.isCurrent) {
      return (
        <div key={week.weekNumber} className="course-week-card current-week">
          {/* Clickable header */}
          <div
            onClick={() => toggleWeek(week.weekNumber)}
            style={{ cursor: "pointer" }}
          >
            <div className="course-week-header">
              <div>
                <div className="course-week-label" style={{ color: "#648C2D" }}>
                  CURRENT WEEK: WEEK {week.weekNumber}
                </div>
                <div className="course-week-title-row">
                  <h2 className="course-week-title">{week.title}</h2>
                  <span className="course-week-icon-inline">
                    <span style={{ filter: "brightness(0) saturate(100%) invert(38%) sepia(60%) saturate(450%) hue-rotate(165deg) brightness(95%)" }}>
                      <PhaseIcon />
                    </span>
                  </span>
                </div>
                <p className="course-week-sub">
                  {week.subtitle || "Lorem ipsum dolor sit amet, consectetur adipiscing elit."}
                </p>
              </div>
              <ProgressRing percent={week.progress} size={80} strokeWidth={7} />
            </div>
          </div>

          {/* Expandable Module Breakdown */}
          {isExpanded && (
            <div className="module-breakdown">
              <div className="module-breakdown-header">
                <span className="breakdown-icon">📊</span>
                <h3 className="breakdown-title">Module Breakdown (Tent.)</h3>
              </div>
              <p className="breakdown-sub">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>

              {week.lessons.map(lesson => {
                const isDone = week.completedIds.includes(lesson.id);
                const Icon = LessonTypeIcons[lesson.type] || LessonTypeIcons.module;
                return (
                  <div
                    key={lesson.id}
                    className="lesson-row-card"
                    onClick={() => navigate(`/lesson/${week.weekNumber}/${lesson.id}`)}
                  >
                    <div className="lesson-row-check">
                      {isDone ? <CheckCircleIcon /> : <CircleEmptyIcon />}
                    </div>
                    <div className="lesson-row-icon"><Icon /></div>
                    <div className="lesson-row-name">{lesson.title}</div>
                    <div className="lesson-row-duration">
                      <ClockSmallIcon />
                      <span>{lesson.duration}</span>
                    </div>
                    <Pill done={isDone} />
                  </div>
                );
              })}
            </div>
          )}

          {/* Chevron toggle */}
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <button
              onClick={() => toggleWeek(week.weekNumber)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 4,
                color: "#666",
                transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              <ChevronDown />
            </button>
          </div>
        </div>
      );
    }

    // ── PAST or LOCKED WEEK CARD (dark maroon, collapsible) ──
    return (
      <div key={week.weekNumber} className={`course-week-card dark-week ${!week.isUnlocked ? "locked-week" : ""}`}>
        {/* Clickable header */}
        <div
          onClick={() => week.isUnlocked && toggleWeek(week.weekNumber)}
          style={{ cursor: week.isUnlocked ? "pointer" : "default" }}
        >
          <div className="course-week-header">
            <div>
              <div className="course-week-label-dark">WEEK {week.weekNumber}</div>
              <div className="course-week-title-row">
                <h2 className="course-week-title-dark">{week.title}</h2>
                <span className="course-week-icon-inline-white"><PhaseIcon /></span>
              </div>
              <p className="course-week-sub-dark">
                {week.subtitle || "Lorem ipsum dolor sit amet, consectetur adipiscing elit."}
              </p>
            </div>
            <ProgressRing percent={week.progress} size={80} strokeWidth={7} dark />
          </div>
        </div>

        {/* Expandable lessons (only for unlocked weeks) */}
        {isExpanded && week.isUnlocked && (
          <div className="module-breakdown-dark">
            {week.lessons.map(lesson => {
              const isDone = week.completedIds.includes(lesson.id);
              const Icon = LessonTypeIcons[lesson.type] || LessonTypeIcons.module;
              return (
                <div
                  key={lesson.id}
                  className="lesson-row-dark"
                  onClick={() => navigate(`/lesson/${week.weekNumber}/${lesson.id}`)}
                >
                  <div className="lesson-row-check">
                    {isDone ? <CheckCircleIcon /> : <CircleEmptyIcon />}
                  </div>
                  <div className="lesson-row-icon"><Icon /></div>
                  <div className="lesson-row-name-dark">{lesson.title}</div>
                  <div className="lesson-row-duration-dark">
                    <ClockSmallIcon />
                    <span>{lesson.duration}</span>
                  </div>
                  <Pill done={isDone} />
                </div>
              );
            })}
          </div>
        )}

        {/* Chevron toggle (only for unlocked weeks) */}
        {week.isUnlocked && (
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <button
              onClick={() => toggleWeek(week.weekNumber)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 4,
                color: "rgba(255,255,255,0.7)",
                transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              <ChevronDown />
            </button>
          </div>
        )}
      </div>
    );
  })
)}
      </main>
    </div>
  );
}