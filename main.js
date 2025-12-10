// API 기본 URL
// Render 서버 직접 사용 (로컬 서버 불필요)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://myteamdashboard.onrender.com';
const PERPLEXITY_API_URL = import.meta.env.VITE_PERPLEXITY_API_URL || 'https://api.perplexity.ai/chat/completions';

// 기본 프롬프트 템플릿
const DEFAULT_PROMPT_TEMPLATE = `당신의 역할:
- 당신은 코레일유통 홍보문화처가 매일 받아보는 "주요 뉴스 브리핑"을 대신 제작하는 전문 뉴스클리핑 용역사의 책임 편집자입니다.
- 목표는 기존 외주업체가 만든 것과 동일한 수준의 "1페이지 요약 리스트"와 상세 뉴스 페이지를, 항상 같은 형식으로 안정적으로 생산하는 것입니다.

출력 언어:
- 모든 출력은 한국어로 작성합니다.

입력:
- 사용자는 다음 정보를 제공합니다.
1) 헤더_문자열 : 예) [ '25.11.24. (월) / 홍보문화처(☎6163)]
2) 기준_날짜 : 예) 2025-11-24
3) (옵션) 기사_목록 : 외부 시스템(크롤러, Perplexity 등)이 미리 수집한 기사 리스트 (제목, 언론사, 링크, 날짜, 본문 요약 등)
- 기사_목록이 제공되지 않으면, 당신은 웹 검색 도구를 활용해 직접 뉴스를 수집합니다.

카테고리 정의:
- 코레일유통 : '코레일유통', '스토리웨이', '역사 상업시설' 등 코레일유통과 직접 연결된 기사
- 철도 : 코레일, SR, 국가철도공단, 도시철도, KTX, SRT, GTX 등 철도 인프라, 노선, 안전, 파업, 철도 정책 관련 기사
- 지역본부/계열사 : 코레일관광개발, 코레일네트웍스, 코레일테크 등 계열사 및 코레일 지역본부 관련 기사
- 공공기관 : 정부 부처(기재부, 국토부 등), 공공기관 정책·투자·규제 등 코레일유통에 간접적 영향을 줄 수 있는 기사
- 유통 : 편의점, 대형마트, 백화점, 리테일, F&B, 프랜차이즈, K-푸드/K-스낵 트렌드 등 일반 유통/소비 트렌드 기사

기사 선별 원칙:
1. **절대적 원칙 - 기준일자 필터링**: 기준_날짜 당일(필요 시 전일 저녁 포함) 기사만 선별합니다. 기준_날짜가 아닌 기사는 절대 포함하지 마세요. 기사의 발행일자를 반드시 확인하고, 기준_날짜와 일치하지 않는 기사는 제외하세요. 할루시네이션(날짜가 다른 기사를 만들어내는 것)을 절대 하지 마세요.
2. **날짜 확인 필수**: 모든 기사를 선별할 때 반드시 기사의 실제 발행일자를 확인하세요. 기준_날짜와 다른 날짜의 기사는 아무리 관련성이 높아도 포함하지 마세요.
3. 서로 내용이 거의 같은 기사는 가장 대표성이 높은 1건만 선택합니다.
4. 다음뉴스, 네이트 등과 같이 뉴스중개사이트의 자료의 경우 원문기사의 언론사를 확인하여 출처로 표시합니다.
5. 각 카테고리별로 1~6개 정도를 목표로 하되, 실제 기사 상황에 따라 유연하게 조정합니다. 단, 기준_날짜에 해당하는 기사가 없으면 해당 카테고리는 비워두세요.
6. 코레일유통, 철도, 지역본부/계열사 관련 기사는 가능하면 빠뜨리지 않고 포함합니다. 단, 반드시 기준_날짜에 발행된 기사만 포함하세요.
7. 공공기관·유통 카테고리는 코레일유통의 사업(철도역 상권, 편의점/도시락/광고 사업, ESG 등)에 의미 있는 이슈만 선별합니다. 역시 기준_날짜에 발행된 기사만 포함하세요.
8. 같은 카테고리 안에서는 "회사/철도 직접 영향도가 큰 기사 → 정책/규제 → 일반 트렌드" 순으로 배치하려고 노력합니다.

카테고리 분류 규칙:
- 기사 제목/내용에 '코레일유통' 또는 '스토리웨이' 등이 명시되면 '코레일유통'으로 분류합니다.
- 코레일, SR, 국가철도공단, 도시철도, KTX·SRT·GTX, 역세권 개발 이슈는 '철도'로 분류합니다.
- 코레일관광개발, 코레일네트웍스, 코레일테크 등 계열사 이름이 있으면 '지역본부/계열사'로 분류합니다.
- 정부 정책, 공공기관 투자·규제, 물가·노동·배송·공공자산 관련 제도 변화는 '공공기관'으로 분류합니다.
- 편의점/마트/프랜차이즈/리테일, K-푸드/K-스낵, 가격·소비 트렌드, 캐릭터 콜라보 등은 '유통'으로 분류합니다.
- 한 기사에 여러 요소가 있어도, 코레일유통/철도/계열사 직접 관련성이 가장 높은 카테고리를 우선합니다.

출력 형식:
- 아래 형식을 반드시 그대로 사용하고, 불필요한 설명이나 주석을 추가하지 않습니다.

* 1page 뉴스요약 페이지
1) 1행: "주요 뉴스 브리핑"
2) 2행: 헤더_문자열 (사용자가 준 값을 그대로 사용)
3) 빈 줄 1줄
4) 각 카테고리별로 다음 형식 반복 (기사 없는 카테고리는 전체 생략)

코레일유통
○기사 제목 1 (언론사)
○기사 제목 2 (언론사)

철도
○기사 제목 1 (언론사)
○기사 제목 2 (언론사)

지역본부/계열사
○기사 제목 1 (언론사)
...

공공기관
○기사 제목 1 (언론사)
...

유통
○기사 제목 1 (언론사)
...

- 카테고리 순서는 항상 다음을 기본으로 합니다.
1) 코레일유통
2) 철도
3) 지역본부/계열사
4) 공공기관
5) 유통
- 해당 카테고리에 선정된 기사가 하나도 없다면, 그 카테고리 제목과 내용 전체를 출력하지 않습니다.
- 각 기사 항목은 반드시 "○"로 시작하고, "제목 (언론사)" 형식을 유지합니다.
- 제목 안의 인용부호, 줄임표, 숫자 등은 기사 원문 제목을 최대한 보존하여 사용합니다.

* 각 뉴스 상세 페이지
1) 1행: "언론사명"
2) 2행: "기사제목"을 볼드체로 크게
3) 3행 이후 : "기사내용"
- 각 뉴스별 페이지가 끝나면 다음 페이지에서 새로 상세 페이지 출력

출력 시 유의사항:
- 중간 과정, 검색 키워드, 내부 설명, 판단 근거는 출력하지 않습니다.
- 오직 최종 브리핑 결과만 출력합니다.
- 사용자가 별도로 지시하지 않는 한, 각 뉴스 상세페이지의 기사내용은 원문의 내용을 충분히 전달할수 있도록 충실하게 작성합니다.`;

// 기본값 관리
const STORAGE_KEY_DEFAULTS = 'newsClipping_defaults';
const STORAGE_KEY_INITIAL = 'newsClipping_initial';
const STORAGE_KEY_VERSION = 'newsClipping_version';
const CURRENT_VERSION = '2.1.1'; // 기본값 업데이트 시 버전 증가

// 초기 기본값
const INITIAL_DEFAULTS = {
    date: new Date().toISOString().split('T')[0],
    header: "",
    basicSetting: `당신의 역할:
- 당신은 코레일유통 홍보문화처가 매일 받아보는 "주요 뉴스 브리핑"을 대신 제작하는 전문 뉴스클리핑 용역사의 책임 편집자입니다.
- 목표는 기존 외주업체가 만든 것과 동일한 수준의 "1페이지 요약 리스트"와 상세 뉴스 페이지를, 항상 같은 형식으로 안정적으로 생산하는 것입니다.

출력 언어:
- 모든 출력은 한국어로 작성합니다.`,
    categoryDefinition: `1) 카테고리 정의

- 코레일유통 : '코레일유통', '스토리웨이', '역사 상업시설' 등 코레일유통과 직접 연결된 기사
- 철도 : 코레일, SR, 국가철도공단, 도시철도, KTX, SRT, GTX 등 철도 인프라, 노선, 안전, 파업, 철도 정책 관련 기사
- 지역본부/계열사 : 코레일관광개발, 코레일네트웍스, 코레일테크 등 계열사 및 코레일 지역본부 관련 기사
- 공공기관 : 정부 부처(기재부, 국토부 등), 공공기관 정책·투자·규제 등 코레일유통에 간접적 영향을 줄 수 있는 기사
- 유통 : 편의점, 대형마트, 백화점, 리테일, F&B, 프랜차이즈, K-푸드/K-스낵 트렌드 등 일반 유통/소비 트렌드 기사`,
    categoryRule: `2) 분류규칙
- 기사 제목/내용에 '코레일유통' 또는 '스토리웨이' 등이 명시되면 '코레일유통'으로 분류합니다.
- 코레일, SR, 국가철도공단, 도시철도, KTX·SRT·GTX, 역세권 개발 이슈는 '철도'로 분류합니다.
- 코레일관광개발, 코레일네트웍스, 코레일테크 등 계열사 이름이 있으면 '지역본부/계열사'로 분류합니다.
- 정부 정책, 공공기관 투자·규제, 물가·노동·배송·공공자산 관련 제도 변화는 '공공기관'으로 분류합니다.
- 편의점/마트/프랜차이즈/리테일, K-푸드/K-스낵, 가격·소비 트렌드, 캐릭터 콜라보 등은 '유통'으로 분류합니다.
- 한 기사에 여러 요소가 있어도, 코레일유통/철도/계열사 직접 관련성이 가장 높은 카테고리를 우선합니다.`,
    selectionPrinciple: `기사선별 원칙:

- **절대적 원칙 - 기준일자 필터링**: 기준_날짜 당일(필요 시 전일 저녁 포함) 기사만 선별합니다. 기준_날짜가 아닌 기사는 절대 포함하지 마세요. 기사의 발행일자를 반드시 확인하고, 기준_날짜와 일치하지 않는 기사는 제외하세요. 할루시네이션(날짜가 다른 기사를 만들어내는 것)을 절대 하지 마세요.

- **날짜 확인 필수**: 모든 기사를 선별할 때 반드시 기사의 실제 발행일자를 확인하세요. 기준_날짜와 다른 날짜의 기사는 아무리 관련성이 높아도 포함하지 마세요.

- 서로 내용이 거의 같은 기사는 가장 대표성이 높은 1건만 선택합니다.

- 다음뉴스, 네이트 등과 같이 뉴스중개사이트의 자료의 경우 원문기사의 언론사를 확인하여 출처로 표시합니다.

- 각 카테고리별로 1~6개 정도를 목표로 하되, 실제 기사 상황에 따라 유연하게 조정합니다. 단, 기준_날짜에 해당하는 기사가 없으면 해당 카테고리는 비워두세요.

- 코레일유통, 철도, 지역본부/계열사 관련 기사는 가능하면 빠뜨리지 않고 포함합니다. 단, 반드시 기준_날짜에 발행된 기사만 포함하세요.

- 공공기관·유통 카테고리는 코레일유통의 사업(철도역 상권, 편의점/도시락/광고 사업, ESG 등)에 의미 있는 이슈만 선별합니다. 역시 기준_날짜에 발행된 기사만 포함하세요.

- 같은 카테고리 안에서는 "회사/철도 직접 영향도가 큰 기사 → 정책/규제 → 일반 트렌드" 순으로 배치하려고 노력합니다.`,
    outputFormat: `출력형식:
- 아래 형식을 반드시 그대로 사용하고, 불필요한 설명이나 주석을 추가하지 않습니다.

* 1page 뉴스요약 페이지
1) 1행: "주요 뉴스 브리핑"
2) 2행: 헤더_문자열 (사용자가 준 값을 그대로 사용)
3) 빈 줄 1줄
4) 각 카테고리별로 다음 형식 반복 (기사 없는 카테고리는 전체 생략)

☐ 코레일유통
○기사 제목 1 (언론사)
○기사 제목 2 (언론사)

☐ 철도
○기사 제목 1 (언론사)
○기사 제목 2 (언론사)

☐ 지역본부/계열사
○기사 제목 1 (언론사)
...

☐ 공공기관
○기사 제목 1 (언론사)
...

☐ 유통
○기사 제목 1 (언론사)
...

- 카테고리 순서는 항상 다음을 기본으로 합니다.
1) 코레일유통
2) 철도
3) 지역본부/계열사
4) 공공기관
5) 유통
- 해당 카테고리에 선정된 기사가 하나도 없다면, 그 카테고리 제목과 내용 전체를 출력하지 않습니다.
- 각 카테고리 항목은 반드시 "☐"로 시작하고, 볼드체로 표시합니다.
- 각 기사 항목은 반드시 "○"로 시작하고, "제목 (언론사)" 형식을 유지합니다.
- 제목 안의 인용부호, 줄임표, 숫자 등은 기사 원문 제목을 최대한 보존하여 사용합니다.

* 각 뉴스 상세 페이지
1) 1행: "언론사명"
2) 2행: "기사제목"을 볼드체로 크게
3) 3행 이후 : "기사내용"
4) 기사내용 다음 : 빈행을 한줄넣고 그 다음행에 "URL: https://..." 형식으로 URL을 표기합니다.
- **중요**: 요약 페이지에 나온 모든 기사에 대해 반드시 상세 페이지를 생성해야 합니다. 빠짐없이 모든 기사의 상세 페이지를 작성하세요. 요약 페이지에 11개 기사가 있다면 상세 페이지도 정확히 11개를 생성해야 합니다.
- 각 뉴스별 페이지가 끝나면 다음 페이지에서 새로 상세 페이지 출력

출력 시 유의사항:
- **절대 금지**: 기준_날짜가 아닌 기사를 포함하지 마세요. 모든 기사는 반드시 기준_날짜에 발행된 것만 사용하세요.
- 중간 과정, 검색 키워드, 내부 설명, 주석표기, 판단 근거는 출력하지 않습니다.
- 오직 최종 브리핑 결과만 출력합니다.
- 사용자가 별도로 지시하지 않는 한, 각 뉴스 상세페이지의 기사내용은 원문의 내용을 충분히 전달할수 있도록 작성합니다.
- 각 기사의 상세 페이지에 기사 발행일자를 명시하지 않아도 되지만, 반드시 기준_날짜에 발행된 기사만 사용하세요.`,
    articleList: "",
    naverKeywords: {
        korail: '코레일유통, 스토리웨이',
        rail: '코레일, KTX, SRT, GTX, 도시철도, 철도노선, 철도안전, 철도정책, 국가철도공단, SR, 철도파업, 철도사고',
        subsidiary: '코레일관광개발, 코레일네트웍스, 코레일테크',
        gov: '기재부, 국토부',
        retail: '편의점, 역세권, 콜라보, 유통트렌드, 소비트렌드, F&B, 프랜차이즈'
    }
};

function getTodayString() {
    return new Date().toISOString().split('T')[0];
}

// 기본값 로드
function loadDefaults() {
    const savedVersion = localStorage.getItem(STORAGE_KEY_VERSION);
    const saved = localStorage.getItem(STORAGE_KEY_DEFAULTS);
    
    // 버전이 다르거나 초기값이 없으면 새 기본값으로 업데이트
    if (savedVersion !== CURRENT_VERSION || !localStorage.getItem(STORAGE_KEY_INITIAL)) {
        console.log(`[기본값 업데이트] 버전 불일치 감지: ${savedVersion || '없음'} → ${CURRENT_VERSION}`);
        localStorage.setItem(STORAGE_KEY_INITIAL, JSON.stringify(INITIAL_DEFAULTS));
        localStorage.setItem(STORAGE_KEY_VERSION, CURRENT_VERSION);
        // 저장된 기본값도 새 버전으로 업데이트
        localStorage.setItem(STORAGE_KEY_DEFAULTS, JSON.stringify(INITIAL_DEFAULTS));
        return INITIAL_DEFAULTS;
    }
    
    // 버전이 같아도 저장된 값의 내용을 확인하여 최신 버전인지 검증
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            // 저장된 값이 최신 버전인지 확인 (selectionPrinciple에 "절대적 원칙" 포함 여부)
            // 이는 서버 배포된 최신 기본값의 특징입니다
            const hasLatestContent = parsed.selectionPrinciple && parsed.selectionPrinciple.includes('절대적 원칙');
            console.log('[기본값 검증]', {
                hasSelectionPrinciple: !!parsed.selectionPrinciple,
                hasLatestContent,
                selectionPrinciplePreview: parsed.selectionPrinciple ? parsed.selectionPrinciple.substring(0, 50) + '...' : '없음'
            });
            
            if (!hasLatestContent) {
                console.log('[기본값 업데이트] 저장된 값이 이전 버전입니다. 서버 배포 기준으로 새 기본값으로 업데이트합니다.');
                localStorage.setItem(STORAGE_KEY_DEFAULTS, JSON.stringify(INITIAL_DEFAULTS));
                return INITIAL_DEFAULTS;
            }
            console.log('[기본값 로드] 저장된 최신 버전 기본값 사용');
            return parsed;
        } catch (e) {
            console.error('[기본값 로드] 저장된 값 파싱 실패, 초기값 사용:', e);
            return INITIAL_DEFAULTS;
        }
    }
    console.log('[기본값 로드] 저장된 값 없음, 초기값 사용');
    return INITIAL_DEFAULTS;
}

// 기본값 저장
function saveDefaults() {
    const defaults = {
        date: document.getElementById('dateInput').value,
        header: document.getElementById('headerInput').value,
        basicSetting: document.getElementById('basicSettingInput').value,
        categoryDefinition: document.getElementById('categoryDefinitionInput').value,
        categoryRule: document.getElementById('categoryRuleInput').value,
        selectionPrinciple: document.getElementById('selectionPrincipleInput').value,
        outputFormat: document.getElementById('outputFormatInput').value,
        articleList: document.getElementById('articleListInput').value,
        naverKeywords: {
            korail: document.getElementById('keywordKorail')?.value || '',
            rail: document.getElementById('keywordRail')?.value || '',
            subsidiary: document.getElementById('keywordSubsidiary')?.value || '',
            gov: document.getElementById('keywordGov')?.value || '',
            retail: document.getElementById('keywordRetail')?.value || ''
        }
    };
    localStorage.setItem(STORAGE_KEY_DEFAULTS, JSON.stringify(defaults));
    alert('기본값이 저장되었습니다.\n\n⚠️ 참고: 저장된 값은 현재 브라우저에만 저장되며, 다른 PC나 브라우저에서는 적용되지 않습니다.');
}

// 기본값 초기화
function resetDefaults() {
    if (confirm('초기 설정값으로 되돌리시겠습니까?\n\n서버에 배포된 최신 기본값으로 되돌아갑니다.\n(현재 저장된 프롬프트 설정값은 유지됩니다)')) {
        // 서버 배포 기준 최신 기본값으로 초기화 설정값 업데이트
        localStorage.setItem(STORAGE_KEY_INITIAL, JSON.stringify(INITIAL_DEFAULTS));
        localStorage.setItem(STORAGE_KEY_VERSION, CURRENT_VERSION);
        
        // UI에 서버 배포 기준 최신 기본값 적용
        document.getElementById('dateInput').value = getTodayString();
        document.getElementById('headerInput').value = INITIAL_DEFAULTS.header || '';
        document.getElementById('basicSettingInput').value = INITIAL_DEFAULTS.basicSetting || '';
        document.getElementById('categoryDefinitionInput').value = INITIAL_DEFAULTS.categoryDefinition || '';
        document.getElementById('categoryRuleInput').value = INITIAL_DEFAULTS.categoryRule || '';
        document.getElementById('selectionPrincipleInput').value = INITIAL_DEFAULTS.selectionPrinciple || '';
        document.getElementById('outputFormatInput').value = INITIAL_DEFAULTS.outputFormat || '';
        document.getElementById('articleListInput').value = INITIAL_DEFAULTS.articleList || '';
        if (document.getElementById('keywordKorail')) {
            document.getElementById('keywordKorail').value = INITIAL_DEFAULTS.naverKeywords.korail || '';
            document.getElementById('keywordRail').value = INITIAL_DEFAULTS.naverKeywords.rail || '';
            document.getElementById('keywordSubsidiary').value = INITIAL_DEFAULTS.naverKeywords.subsidiary || '';
            document.getElementById('keywordGov').value = INITIAL_DEFAULTS.naverKeywords.gov || '';
            document.getElementById('keywordRetail').value = INITIAL_DEFAULTS.naverKeywords.retail || '';
        }
        
        // 주의: STORAGE_KEY_DEFAULTS는 업데이트하지 않음 (사용자가 저장한 프롬프트 설정값 유지)
        // 초기화 버튼은 서버 배포 기준 초기값으로 UI만 되돌림
        alert('서버 배포 기준 최신 초기 설정값으로 되돌렸습니다.\n\n💡 현재 입력된 값들을 "기본값 저장" 버튼으로 저장하면 다음에 불러올 수 있습니다.');
    }
}

// 날짜로부터 헤더 문자열 자동 생성
function generateHeaderFromDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const year = date.getFullYear().toString().slice(-2); // 마지막 2자리
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[date.getDay()];
    
    return `[ '${year}.${month}.${day}. (${weekday}) / 홍보문화처(☎6163)]`;
}

// UI에 기본값 적용
function applyDefaults() {
    // 버전 체크 및 자동 업데이트
    const savedVersion = localStorage.getItem(STORAGE_KEY_VERSION);
    const hasInitial = localStorage.getItem(STORAGE_KEY_INITIAL);
    const needsUpdate = savedVersion !== CURRENT_VERSION || !hasInitial;
    
    console.log('[기본값 체크]', {
        savedVersion,
        CURRENT_VERSION,
        hasInitial: !!hasInitial,
        needsUpdate
    });
    
    if (needsUpdate) {
        // 새 기본값으로 강제 업데이트
        localStorage.setItem(STORAGE_KEY_INITIAL, JSON.stringify(INITIAL_DEFAULTS));
        localStorage.setItem(STORAGE_KEY_VERSION, CURRENT_VERSION);
        // 저장된 기본값도 새 버전으로 업데이트 (서버 배포 기준)
        localStorage.setItem(STORAGE_KEY_DEFAULTS, JSON.stringify(INITIAL_DEFAULTS));
        console.log(`[기본값 업데이트] 버전 ${savedVersion || '없음'} → ${CURRENT_VERSION}로 업데이트되었습니다.`);
        
        // 서버 배포 기준 최신 기본값을 바로 UI에 적용
        const defaults = INITIAL_DEFAULTS;
        const today = getTodayString();
        const dateValue = today;
        
        document.getElementById('dateInput').value = dateValue;
        
        // 헤더가 없으면 날짜로부터 자동 생성
        if (!defaults.header) {
            document.getElementById('headerInput').value = generateHeaderFromDate(dateValue);
        } else {
            document.getElementById('headerInput').value = defaults.header;
        }
        
        document.getElementById('basicSettingInput').value = defaults.basicSetting || '';
        document.getElementById('categoryDefinitionInput').value = defaults.categoryDefinition || '';
        document.getElementById('categoryRuleInput').value = defaults.categoryRule || '';
        document.getElementById('selectionPrincipleInput').value = defaults.selectionPrinciple || '';
        document.getElementById('outputFormatInput').value = defaults.outputFormat || '';
        document.getElementById('articleListInput').value = defaults.articleList || '';
        if (document.getElementById('keywordKorail')) {
            document.getElementById('keywordKorail').value = defaults.naverKeywords.korail || '';
            document.getElementById('keywordRail').value = defaults.naverKeywords.rail || '';
            document.getElementById('keywordSubsidiary').value = defaults.naverKeywords.subsidiary || '';
            document.getElementById('keywordGov').value = defaults.naverKeywords.gov || '';
            document.getElementById('keywordRetail').value = defaults.naverKeywords.retail || '';
        }
        return; // 여기서 종료
    }
    
    // 버전이 같으면 저장된 값 사용 (하지만 내용 검증은 loadDefaults에서 수행)
    const defaults = loadDefaults();
    const today = getTodayString();
    const dateValue = today;
    
    document.getElementById('dateInput').value = dateValue;
    
    // 헤더가 없으면 날짜로부터 자동 생성
    if (!defaults.header) {
        document.getElementById('headerInput').value = generateHeaderFromDate(dateValue);
    } else {
        document.getElementById('headerInput').value = defaults.header;
    }
    
    document.getElementById('basicSettingInput').value = defaults.basicSetting || '';
    document.getElementById('categoryDefinitionInput').value = defaults.categoryDefinition || '';
    document.getElementById('categoryRuleInput').value = defaults.categoryRule || '';
    document.getElementById('selectionPrincipleInput').value = defaults.selectionPrinciple || '';
    document.getElementById('outputFormatInput').value = defaults.outputFormat || '';
    document.getElementById('articleListInput').value = defaults.articleList || '';
    if (document.getElementById('keywordKorail')) {
        document.getElementById('keywordKorail').value = defaults.naverKeywords?.korail || '';
        document.getElementById('keywordRail').value = defaults.naverKeywords?.rail || '';
        document.getElementById('keywordSubsidiary').value = defaults.naverKeywords?.subsidiary || '';
        document.getElementById('keywordGov').value = defaults.naverKeywords?.gov || '';
        document.getElementById('keywordRetail').value = defaults.naverKeywords?.retail || '';
    }
}

// Perplexity API 호출
async function callPerplexityAPI(prompt) {
    // API 키는 서버에서 관리하거나 환경변수로 설정 필요
    // 여기서는 서버 API를 통해 호출하는 방식으로 구현
    try {
        const response = await fetch(`${API_BASE_URL}/api/perplexity-chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                model: 'sonar-pro',
                max_tokens: 8000,
                temperature: 0.5
            })
        });

        if (!response.ok) {
            let errorMessage = `API 호출 실패: ${response.status}`;
            
            if (response.status === 404) {
                errorMessage = `404 오류: 서버에 '/api/perplexity-chat' 엔드포인트가 없습니다.\n\n` +
                    `가능한 원인:\n` +
                    `1. Render 서버에 최신 코드가 배포되지 않았을 수 있습니다.\n` +
                    `2. 서버가 재시작되지 않았을 수 있습니다.\n\n` +
                    `해결 방법:\n` +
                    `- Render 대시보드에서 서버를 재배포하거나 재시작해주세요.`;
            } else {
                try {
                    const errorData = await response.json();
                    errorMessage += ` - ${errorData.error || errorData.message || '알 수 없는 오류'}`;
                } catch (e) {
                    const text = await response.text().catch(() => '');
                    errorMessage += ` - ${text || '알 수 없는 오류'}`;
                }
            }
            
            throw new Error(errorMessage);
        }

        const data = await response.json();
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            console.error('예상치 못한 응답 형식:', data);
            throw new Error('서버 응답 형식이 올바르지 않습니다.');
        }
        
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Perplexity API 호출 오류:', error);
        throw error;
    }
}

// 프롬프트 생성
function buildPrompt() {
    const date = document.getElementById('dateInput').value;
    const header = document.getElementById('headerInput').value;
    const basicSetting = document.getElementById('basicSettingInput').value;
    const categoryDefinition = document.getElementById('categoryDefinitionInput').value;
    const categoryRule = document.getElementById('categoryRuleInput').value;
    const selectionPrinciple = document.getElementById('selectionPrincipleInput').value;
    const outputFormat = document.getElementById('outputFormatInput').value;
    const articleList = document.getElementById('articleListInput').value.trim();

    let prompt = '';

    // 기본설정
    if (basicSetting) {
        prompt += basicSetting + '\n\n';
    }

    // 입력 정보
    prompt += `입력:\n`;
    prompt += `- 사용자는 다음 정보를 제공합니다.\n`;
    prompt += `1) 헤더_문자열 : ${header || '예) [ \'25.11.24. (월) / 홍보문화처(☎6163)]'}\n`;
    prompt += `2) 기준_날짜 : ${date}\n`;
    if (articleList) {
        prompt += `3) 기사_목록 : 외부 시스템(크롤러, 네이버 뉴스 API 등)이 미리 수집한 기사 리스트\n${articleList}\n`;
        prompt += `\n⚠️ **절대적 원칙 - 기사 목록 사용**:\n`;
        prompt += `- 위에 제공된 기사_목록에 있는 기사만 사용하여 뉴스 브리핑을 작성하세요.\n`;
        prompt += `- 기사_목록에 없는 기사를 절대 생성하거나 추가하지 마세요.\n`;
        prompt += `- 기사_목록의 기사 중 기준_날짜(${date})에 발행된 것만 선별하여 사용하세요.\n`;
        prompt += `- 기사_목록에 기사가 부족한 경우, 해당 카테고리는 비워두거나 기사 수를 줄이세요. 새로운 기사를 만들어내지 마세요.\n`;
        prompt += `- 할루시네이션(존재하지 않는 기사 생성)을 절대 하지 마세요.\n`;
        prompt += `- 기사_목록 내에서도 제목/URL이 동일한 중복 기사는 하나만 사용하세요.\n`;
        prompt += `- 추가 뉴스 검색을 하지 마세요. 주어진 기사 목록만 사용하세요.\n`;
        prompt += `- 기사 목록에는 언론사명이 포함되지 않을 수 있습니다. 각 URL을 보고 실제 한글 언론사명을 추론하여 "제목 (언론사)" 형태로 표기하세요.\n`;
    } else {
        prompt += `3) 기사_목록 : 제공되지 않음 (웹 검색 도구를 활용해 직접 뉴스를 수집해주세요)\n`;
        prompt += `⚠️ **중요**: 웹 검색 시 반드시 기준_날짜(${date})에 발행된 기사만 검색하고 선별하세요.\n`;
    }
    prompt += '\n';

    // 카테고리 정의
    if (categoryDefinition) {
        prompt += `카테고리 정의:\n${categoryDefinition}\n\n`;
    }

    // 분류규칙
    if (categoryRule) {
        prompt += `카테고리 분류 규칙:\n${categoryRule}\n\n`;
    }

    // 기사선별 원칙
    if (selectionPrinciple) {
        prompt += `${selectionPrinciple}\n\n`;
    }

    // 출력형식
    if (outputFormat) {
        prompt += `${outputFormat}\n\n`;
    }

    prompt += `위 정보를 바탕으로 뉴스 브리핑을 생성해주세요.`;
    
    return prompt;
}

// 진행 상태 업데이트
function updateProgress(step, message, percentage) {
    const progressCard = document.getElementById('progressCard');
    const progressSteps = document.getElementById('progressSteps');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    
    progressCard.style.display = 'block';
    
    // 단계별 상태 표시
    const steps = [
        { id: 'collect', name: '기사 수집', icon: 'fa-search' },
        { id: 'generate', name: 'AI 생성', icon: 'fa-magic' }
    ];
    
    let stepsHtml = '';
    steps.forEach((s, index) => {
        const isActive = index === step;
        const isCompleted = index < step;
        const statusClass = isCompleted ? 'text-success' : (isActive ? 'text-primary' : 'text-muted');
        const iconClass = isCompleted ? 'fa-check-circle' : (isActive ? 'fa-spinner fa-spin' : s.icon);
        
        stepsHtml += `
            <div class="d-flex align-items-center mb-2">
                <i class="fas ${iconClass} ${statusClass} me-2"></i>
                <span class="${statusClass}">${s.name}</span>
            </div>
        `;
    });
    
    progressSteps.innerHTML = stepsHtml;
    progressBar.style.width = `${percentage}%`;
    progressText.textContent = message;
}

// 키워드 문자열 파싱 (쉼표/줄바꿈)
function parseKeywordString(str) {
    if (!str) return [];
    return str.split(/[\n,]/).map(s => s.trim()).filter(Boolean);
}

function getCustomKeywords() {
    return {
        korail: parseKeywordString(document.getElementById('keywordKorail')?.value || ''),
        rail: parseKeywordString(document.getElementById('keywordRail')?.value || ''),
        subsidiary: parseKeywordString(document.getElementById('keywordSubsidiary')?.value || ''),
        gov: parseKeywordString(document.getElementById('keywordGov')?.value || ''),
        retail: parseKeywordString(document.getElementById('keywordRetail')?.value || '')
    };
}

// 기사 중복 제거 (제목+URL 기준)
function dedupArticles(articles) {
    if (!articles) return [];
    const map = new Map();
    const norm = (s) => (s || '').replace(/\s+/g, ' ').trim().toLowerCase();
    return articles.filter(a => {
        const key = `${norm(a.title)}|${(a.url || '').split('#')[0]}`;
        if (map.has(key)) return false;
        map.set(key, true);
        return true;
    });
}

// 기사 수집
async function collectArticles(date) {
    updateProgress(0, '네이버 뉴스에서 기사를 수집하고 있습니다...', 10);
    
    try {
        const customKeywords = getCustomKeywords();
        const response = await fetch(`${API_BASE_URL}/api/news-clipping/collect-articles`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ date, customKeywords })
        });

        if (!response.ok) {
            throw new Error(`기사 수집 실패: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || '기사 수집 실패');
        }

        updateProgress(0, `기사 수집 완료: 총 ${data.totalArticles}건 (${Object.entries(data.articlesByCategory).map(([cat, arts]) => `${cat}: ${arts.length}건`).join(', ')})`, 50);
        
        return data.articles;
    } catch (error) {
        console.error('기사 수집 오류:', error);
        // 기사 수집 실패해도 계속 진행 (기존 방식으로 fallback)
        updateProgress(0, '기사 수집 실패 - 기존 방식으로 진행합니다.', 50);
        return null;
    }
}

// 기사 리스트를 프롬프트 형식으로 변환 (토큰 제한을 위해 간결하게)
function formatArticleList(articles) {
    if (!articles || articles.length === 0) {
        return '';
    }
    
    // 1단계: 전체 리스트를 병합
    const allArticles = [...articles];
    
    // 2단계: 제목 기준으로 중복 제거 (제목 정규화 후 비교)
    const titleMap = new Map();
    const dedupedArticles = [];
    const norm = (s) => (s || '').replace(/\s+/g, ' ').trim().toLowerCase();
    
    for (const article of allArticles) {
        const normalizedTitle = norm(article.title);
        if (!titleMap.has(normalizedTitle)) {
            titleMap.set(normalizedTitle, true);
            dedupedArticles.push(article);
        }
    }
    
    console.log(`[기사 중복 제거] 원본: ${allArticles.length}건 → 제목 중복 제거 후: ${dedupedArticles.length}건`);
    
    // 3단계: 카테고리별로 그룹화
    const byCategory = {};
    dedupedArticles.forEach(article => {
        if (!byCategory[article.category]) {
            byCategory[article.category] = [];
        }
        byCategory[article.category].push(article);
    });
    
    // 4단계: 카테고리별로 출력 (제한 없음)
    let formatted = '=== 수집된 기사 목록 ===\n\n';
    for (const [category, categoryArticles] of Object.entries(byCategory)) {
        formatted += `[${category}] (${categoryArticles.length}건)\n`;
        categoryArticles.forEach((article, index) => {
            // 간결하게: 제목과 URL만 포함 (요약 제거)
            formatted += `${index + 1}. ${article.title}\n`;
            formatted += `   ${article.url}\n`;
        });
        formatted += '\n';
    }
    
    return formatted;
}

// 자료 생성
async function generateContent() {
    const date = document.getElementById('dateInput').value;
    const basicSetting = document.getElementById('basicSettingInput').value.trim();
    const categoryDefinition = document.getElementById('categoryDefinitionInput').value.trim();
    const selectionPrinciple = document.getElementById('selectionPrincipleInput').value.trim();
    const outputFormat = document.getElementById('outputFormatInput').value.trim();

    if (!date) {
        alert('기준 날짜를 입력해주세요.');
        return;
    }

    if (!basicSetting || !categoryDefinition || !selectionPrinciple || !outputFormat) {
        alert('모든 필수 항목(기본설정, 카테고리 정의, 기사선별 원칙, 출력형식)을 입력해주세요.');
        return;
    }

    // UI 초기화
    document.getElementById('progressCard').style.display = 'block';
    document.getElementById('loadingSpinner').style.display = 'none';
    document.getElementById('resultCard').style.display = 'none';
    document.getElementById('generateBtn').disabled = true;

    try {
        // 1단계: 기사 수집
        const collectedArticles = await collectArticles(date);
        const dedupedArticles = collectedArticles ? dedupArticles(collectedArticles) : null;
        
        // 2단계: AI 생성
        updateProgress(1, 'AI가 뉴스 클리핑을 생성하고 있습니다...', 60);
        
        // 프롬프트 생성 (수집된 기사 포함)
        const articleListText = dedupedArticles ? formatArticleList(dedupedArticles) : '';
        
        // 기사 목록을 임시로 textarea에 설정 (buildPrompt에서 사용)
        const originalArticleList = document.getElementById('articleListInput').value;
        if (dedupedArticles && articleListText) {
            document.getElementById('articleListInput').value = articleListText;
        }
        
        const prompt = buildPrompt();
        
        // 원래 값 복원
        document.getElementById('articleListInput').value = originalArticleList;
        
        updateProgress(1, 'Perplexity API 호출 중...', 80);
        const result = await callPerplexityAPI(prompt);
        
        updateProgress(1, '완료!', 100);
        
        // 결과 표시
        displayResult(result);
        document.getElementById('resultCard').style.display = 'block';
        
        // 결과를 전역 변수에 저장 (PDF, 복사 등에서 사용)
        window.currentResult = result;
        
        // 진행 상태 카드 숨기기
        setTimeout(() => {
            document.getElementById('progressCard').style.display = 'none';
        }, 2000);
        
    } catch (error) {
        alert('자료 생성 중 오류가 발생했습니다: ' + error.message);
        console.error(error);
        document.getElementById('progressCard').style.display = 'none';
    } finally {
        document.getElementById('loadingSpinner').style.display = 'none';
        document.getElementById('generateBtn').disabled = false;
    }
}

// 결과 표시
function displayResult(result) {
    const preview = document.getElementById('previewContent');
    const lines = result.split('\n');
    let html = '';
    let inSummaryPage = true;
    let publisherNumber = 0; // 언론사명 넘버링용
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // 상세 페이지 구분 (--- 구분선 또는 "* 각 뉴스 상세 페이지" 마커)
        if (line === '---' || line.startsWith('* 각 뉴스 상세 페이지')) {
            inSummaryPage = false;
            publisherNumber = 0; // 상세 페이지 진입 시 넘버링 초기화
            html += '<hr class="detail-separator">';
            continue;
        }
        
        // 상세 페이지 자동 감지: 언론사명 패턴이 나오면 상세 페이지로 전환
        let detectionLine = line.replace(/\s*\([^)]*\)\s*$/, '').trim(); // 괄호 제거
        const isKoreanPublisher = detectionLine.match(/^[가-힣][가-힣\s\d\w]*$/);
        const isEnglishPublisher = detectionLine.match(/^[A-Z][A-Z0-9]{1,10}$/);
        
        const isPublisherNameForDetection = (isKoreanPublisher || isEnglishPublisher) && 
            !detectionLine.includes('주요') && !detectionLine.includes('브리핑') && 
            detectionLine.length < 30 && !detectionLine.startsWith('☐') && !detectionLine.startsWith('○') && 
            !detectionLine.startsWith('**') && detectionLine !== '---' && !detectionLine.match(/^\(URL/) &&
            !detectionLine.match(/^https?:\/\//) && !detectionLine.match(/^\(URL 생략/);
        
        if (inSummaryPage && isPublisherNameForDetection && i > 5) { // 요약 페이지에서 언론사명이 나오면 상세 페이지로 전환
            inSummaryPage = false;
            publisherNumber = 0;
            html += '<hr class="detail-separator">';
        }
        
        if (inSummaryPage) {
            // "주요 뉴스 브리핑" 제목
            if (line === '주요 뉴스 브리핑') {
                html += '<h1 class="main-title">주요 뉴스 브리핑</h1>';
                continue;
            }
            
            // 헤더 문자열 (날짜 정보) - [ ] 형식 또는 일반 날짜 형식
            if (line.match(/^\[.*\]$/) || line.match(/^\d{2}\.\d{2}\.\d{2}\./)) {
                html += `<div class="header-info">${line}</div>`;
                continue;
            }
            
            // 카테고리 제목 (☐로 시작하거나 ☐ **...** 형식)
            // 여러 줄에 걸쳐 있을 수 있으므로 전체를 볼드 처리
            // ☐ 문자를 HTML 엔티티로 처리하여 깨짐 방지
            const checkboxChar = '☐'; // HTML에서 그대로 사용 가능
            const categoryMatch1 = line.match(/^☐\s*\*\*(.+?)\*\*/);
            const categoryMatch2 = line.match(/^\*\*☐\s*(.+?)\*\*/);
            if (categoryMatch1) {
                // 형식: ☐ **카테고리명** (전체 볼드)
                html += `<h2 class="category-title"><strong>${checkboxChar} ${categoryMatch1[1]}</strong></h2>`;
                continue;
            } else if (categoryMatch2) {
                // 형식: **☐ 카테고리명** (전체 볼드)
                html += `<h2 class="category-title"><strong>${checkboxChar} ${categoryMatch2[1]}</strong></h2>`;
                continue;
            } else if (line.startsWith('☐ ')) {
                // 일반 형식: ☐ 카테고리명 (마크다운 제거 후 전체 볼드)
                const cleanCategory = line.replace(/\*\*(.*?)\*\*/g, '$1');
                html += `<h2 class="category-title"><strong>${cleanCategory}</strong></h2>`;
                continue;
            }
            
            // 기사 항목 (○로 시작) - 주석 표기 제거
            if (line.startsWith('○')) {
                // [1], [2] 같은 주석 표기 제거
                const cleanedLine = line.replace(/\[\d+\]/g, '');
                html += `<div class="article-item">${cleanedLine}</div>`;
                continue;
            }
            
            // 빈 줄
            if (!line) {
                html += '<br>';
                continue;
            }
        } else {
            // 상세 페이지 처리
            // 언론사명 (한글 또는 영문) - 넘버링 추가
            // 패턴: 한글로 시작하거나 영문 대문자로만 구성된 짧은 문자열
            // 이미 넘버링이 포함된 경우(예: "2. 서울경제")도 처리
            const hasExistingNumber = line.match(/^\d+\.\s*(.+)$/);
            let publisherNameOnly = hasExistingNumber ? hasExistingNumber[1] : line;
            
            // 괄호 안의 부가 정보 제거 (예: "대한민국 정책브리핑(기획재정부)" → "대한민국 정책브리핑")
            publisherNameOnly = publisherNameOnly.replace(/\s*\([^)]*\)\s*$/, '').trim();
            
            // 한글로 시작하는 언론사명 또는 영문 대문자만으로 구성된 언론사명 (KBS, YTN 등)
            const isKoreanPublisher = publisherNameOnly.match(/^[가-힣][가-힣\s\d\w]*$/);
            const isEnglishPublisher = publisherNameOnly.match(/^[A-Z][A-Z0-9]{1,10}$/); // 영문 대문자만, 2-11자
            
            const isPublisherName = (isKoreanPublisher || isEnglishPublisher) && 
                !publisherNameOnly.includes('주요') && !publisherNameOnly.includes('브리핑') && 
                publisherNameOnly.length < 30 && !publisherNameOnly.startsWith('☐') && !publisherNameOnly.startsWith('○') && 
                !publisherNameOnly.startsWith('**') && publisherNameOnly !== '---' && !publisherNameOnly.match(/^\(URL/) &&
                !publisherNameOnly.match(/^https?:\/\//) && !publisherNameOnly.match(/^\(URL 생략/) &&
                !publisherNameOnly.match(/^URL:/i);
            
            if (isPublisherName) {
                publisherNumber++;
                html += `<h3 class="publisher-name">${publisherNumber}. ${publisherNameOnly}</h3>`;
                continue;
            }
            
            // 기사 제목 (**...** 형식) - 주석 표기 제거
            const titleMatch = line.match(/\*\*(.+?)\*\*/);
            if (titleMatch) {
                // 제목에서 주석 표기 제거
                const cleanedTitle = titleMatch[1].replace(/\[\d+\]/g, '');
                html += `<h4 class="article-title">${cleanedTitle}</h4>`;
                continue;
            }
            
            // URL 처리 (실제 URL만 링크, 생략 메시지는 그대로)
            // "URL: https://..." 형식도 처리
            const urlMatch = line.match(/^URL:\s*(https?:\/\/.+)$/i);
            if (urlMatch) {
                html += `<div class="article-url"><a href="${urlMatch[1]}" target="_blank" rel="noopener noreferrer">${urlMatch[1]}</a></div>`;
                continue;
            }
            
            if (line.match(/^https?:\/\//)) {
                html += `<div class="article-url"><a href="${line}" target="_blank" rel="noopener noreferrer">${line}</a></div>`;
                continue;
            }
            
            // URL 생략 메시지
            if (line.match(/^\(URL 생략/)) {
                html += `<div class="article-url-omitted">${line}</div>`;
                continue;
            }
            
            // 기사 내용 - 주석 표기 제거
            if (line && line !== '---') {
                // [1], [2] 같은 주석 표기 제거
                let processedLine = line.replace(/\[\d+\]/g, '');
                // 마크다운 볼드체 처리
                processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                html += `<p class="article-content">${processedLine}</p>`;
                continue;
            }
        }
    }
    
    preview.innerHTML = html;
}

// 뉴스목록 복사 (1페이지 요약 부분만)
function copyNewsList() {
    if (!window.currentResult) {
        alert('생성된 자료가 없습니다.');
        return;
    }

    // 1페이지 요약 부분에서 기사 항목만 추출
    const lines = window.currentResult.split('\n');
    let summaryStart = -1;
    let summaryEnd = -1;

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim() === '주요 뉴스 브리핑') {
            summaryStart = i;
        }
        if (summaryStart >= 0 && lines[i].trim().startsWith('* 각 뉴스 상세 페이지')) {
            summaryEnd = i;
            break;
        }
    }

    let newsListText = '주요뉴스 브리핑\n\n';
    let articleNumber = 0;

    if (summaryStart >= 0) {
        const summaryLines = summaryEnd > 0 
            ? lines.slice(summaryStart, summaryEnd)
            : lines.slice(summaryStart);
        
        // ○로 시작하는 기사 항목만 추출
        for (const line of summaryLines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('○')) {
                // ○기사 제목 (언론사) 형식에서 기사 제목과 언론사 추출
                const match = trimmedLine.match(/^○(.+?)\s*\(([^)]+)\)$/);
                if (match) {
                    articleNumber++;
                    const title = match[1].trim();
                    const publisher = match[2].trim();
                    newsListText += `${articleNumber}. ${title} (${publisher})\n\n`;
                } else {
                    // 괄호가 없는 경우도 처리
                    const title = trimmedLine.replace(/^○/, '').trim();
                    if (title) {
                        articleNumber++;
                        newsListText += `${articleNumber}. ${title}\n\n`;
                    }
                }
            }
        }
    } else {
        // 패턴을 찾지 못한 경우 전체에서 요약 부분 추출 시도
        const summaryText = window.currentResult.split('* 각 뉴스 상세 페이지')[0];
        const summaryLines = summaryText.split('\n');
        for (const line of summaryLines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('○')) {
                const match = trimmedLine.match(/^○(.+?)\s*\(([^)]+)\)$/);
                if (match) {
                    articleNumber++;
                    const title = match[1].trim();
                    const publisher = match[2].trim();
                    newsListText += `${articleNumber}. ${title} (${publisher})\n\n`;
                }
            }
        }
    }

    newsListText = newsListText.trim();

    navigator.clipboard.writeText(newsListText).then(() => {
        alert('뉴스목록이 클립보드에 복사되었습니다.');
    }).catch(err => {
        console.error('복사 실패:', err);
        alert('복사에 실패했습니다.');
    });
}

// 카카오톡 공유자료 생성
function copyKakaoFormat() {
    if (!window.currentResult) {
        alert('생성된 자료가 없습니다.');
        return;
    }

    // 날짜 가져오기
    const dateInput = document.getElementById('dateInput').value;
    let dateText = '';
    if (dateInput) {
        const date = new Date(dateInput);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        dateText = `${year}년 ${month}월 ${day}일 뉴스입니다.\n\n`;
    }

    // 상세 페이지에서 기사 정보 추출 (언론사명, 기사 제목, URL)
    const lines = window.currentResult.split('\n');
    let inDetailPage = false;
    let inSummaryPage = true;
    let currentPublisher = '';
    let currentTitle = '';
    let currentUrl = '';
    const articles = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // 상세 페이지 시작 감지
        if (line === '---' || line.startsWith('* 각 뉴스 상세 페이지')) {
            inDetailPage = true;
            inSummaryPage = false;
            continue;
        }

        // 요약 페이지에서 언론사명이 나오면 상세 페이지로 전환 (자동 감지)
        // "1. 시사뉴스" 같은 형식도 감지
        if (inSummaryPage && i > 5) {
            // 이미 넘버링이 있는 경우
            const hasNumber = line.match(/^\d+\.\s*(.+)$/);
            let publisherNameOnly = hasNumber ? hasNumber[1] : line;
            
            // 괄호 안의 부가 정보 제거
            publisherNameOnly = publisherNameOnly.replace(/\s*\([^)]*\)\s*$/, '').trim();
            
            // 한글로 시작하는 언론사명 또는 영문 대문자만으로 구성된 언론사명
            const isKoreanPublisher = publisherNameOnly.match(/^[가-힣][가-힣\s\d\w]*$/);
            const isEnglishPublisher = publisherNameOnly.match(/^[A-Z][A-Z0-9]{1,10}$/);
            
            const isPublisherNameForDetection = (isKoreanPublisher || isEnglishPublisher) && 
                !publisherNameOnly.includes('주요') && !publisherNameOnly.includes('브리핑') && 
                publisherNameOnly.length < 30 && !publisherNameOnly.startsWith('☐') && !publisherNameOnly.startsWith('○') &&
                !publisherNameOnly.startsWith('**') && publisherNameOnly !== '---' && !publisherNameOnly.match(/^\(URL/) &&
                !publisherNameOnly.match(/^https?:\/\//) && !publisherNameOnly.match(/^\(URL 생략/) &&
                !publisherNameOnly.match(/^URL:/i);
            
            if (isPublisherNameForDetection) {
                inDetailPage = true;
                inSummaryPage = false;
                // 첫 번째 언론사명 처리
                if (hasNumber) {
                    currentPublisher = publisherNameOnly;
                } else {
                    currentPublisher = line;
                }
                continue;
            }
        }

        if (inDetailPage) {
            // 언론사명 감지 (한글 또는 영문)
            // 이미 넘버링이 있는 경우(예: "1. 매일경제", "2. 연합뉴스TV")도 처리
            const hasExistingNumber = line.match(/^\d+\.\s*(.+)$/);
            let publisherNameOnly = hasExistingNumber ? hasExistingNumber[1] : line;
            
            // 괄호 안의 부가 정보 제거
            publisherNameOnly = publisherNameOnly.replace(/\s*\([^)]*\)\s*$/, '').trim();
            
            // 한글로 시작하는 언론사명 또는 영문 대문자만으로 구성된 언론사명
            const isKoreanPublisher = publisherNameOnly.match(/^[가-힣][가-힣\s\d\w]*$/);
            const isEnglishPublisher = publisherNameOnly.match(/^[A-Z][A-Z0-9]{1,10}$/);
            
            const isPublisherName = (isKoreanPublisher || isEnglishPublisher) && 
                !publisherNameOnly.includes('주요') && !publisherNameOnly.includes('브리핑') && 
                publisherNameOnly.length < 30 && !publisherNameOnly.startsWith('☐') && !publisherNameOnly.startsWith('○') &&
                !publisherNameOnly.startsWith('**') && publisherNameOnly !== '---' && !publisherNameOnly.match(/^\(URL/) &&
                !publisherNameOnly.match(/^https?:\/\//) && !publisherNameOnly.match(/^\(URL 생략/) &&
                !publisherNameOnly.match(/^URL:/i);
            
            if (isPublisherName) {
                // 이전 기사 저장
                if (currentPublisher && currentTitle) {
                    articles.push({
                        publisher: currentPublisher,
                        title: currentTitle,
                        url: currentUrl || ''
                    });
                }
                // 새 기사 시작
                currentPublisher = publisherNameOnly;
                currentTitle = '';
                currentUrl = '';
                continue;
            }

            // 기사 제목 (**...** 형식 또는 일반 텍스트)
            const titleMatch = line.match(/\*\*(.+?)\*\*/);
            if (titleMatch) {
                currentTitle = titleMatch[1].replace(/\[\d+\]/g, '').trim();
                continue;
            }
            
            // 볼드체가 없는 경우: 언론사명 다음에 나오는 첫 번째 긴 줄이 제목일 수 있음
            if (!currentTitle && currentPublisher && line && 
                !line.match(/^https?:\/\//) && !line.match(/^URL:/i) &&
                !line.match(/^\d+\.\s*/) && line.length > 15 &&
                !line.startsWith('☐') && !line.startsWith('○')) {
                // 언론사명 다음에 나오는 첫 번째 의미있는 긴 줄을 제목으로 간주
                currentTitle = line;
                continue;
            }

            // URL 추출
            const urlMatch = line.match(/^URL:\s*(https?:\/\/.+)$/i);
            if (urlMatch) {
                currentUrl = urlMatch[1].trim();
                continue;
            }
            if (line.match(/^https?:\/\//)) {
                currentUrl = line.trim();
                continue;
            }
        }
    }

    // 마지막 기사 저장
    if (currentPublisher && currentTitle) {
        articles.push({
            publisher: currentPublisher,
            title: currentTitle,
            url: currentUrl || ''
        });
    }

    // 카카오톡 형식으로 변환
    let kakaoText = dateText;
    articles.forEach((article, index) => {
        const urlText = article.url ? ` ${article.url}` : '';
        kakaoText += `${index + 1}. ${article.title} (${article.publisher})${urlText}\n\n`;
    });

    kakaoText = kakaoText.trim();

    navigator.clipboard.writeText(kakaoText).then(() => {
        alert('카카오톡 공유자료가 클립보드에 복사되었습니다.');
    }).catch(err => {
        console.error('복사 실패:', err);
        alert('복사에 실패했습니다.');
    });
}

// PDF 생성
async function generatePDF() {
    if (!window.currentResult) {
        alert('생성된 자료가 없습니다.');
        return;
    }

    const generatePdfBtn = document.getElementById('generatePdfBtn');
    const originalText = generatePdfBtn ? generatePdfBtn.innerHTML : '';

    // 로딩 상태로 변경
    if (generatePdfBtn) {
        generatePdfBtn.disabled = true;
        generatePdfBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>PDF 생성 중...';
    }

    try {
        const date = document.getElementById('dateInput').value || new Date().toISOString().split('T')[0];
        const filename = `뉴스클리핑_${date}`;

        // 서버에 PDF 생성 요청
        const response = await fetch(`${API_BASE_URL}/api/news-clipping/generate-pdf`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: window.currentResult,
                filename: filename
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `PDF 생성 실패: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            // 대시보드와 동일한 방식: 두 단계로 처리
            // 1단계: PDF 생성 완료 → 2단계: 다운로드
            const downloadUrl = `${API_BASE_URL}/api/news-clipping/download-pdf/${result.data.fileName}`;
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = result.data.fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            alert('PDF가 다운로드되었습니다.');
        } else {
            throw new Error(result.error || 'PDF 생성 실패');
        }
    } catch (error) {
        console.error('PDF 생성 오류:', error);
        alert('PDF 생성 중 오류가 발생했습니다: ' + error.message);
    } finally {
        // 버튼 원래 상태로 복원
        if (generatePdfBtn) {
            generatePdfBtn.disabled = false;
            generatePdfBtn.innerHTML = originalText;
        }
    }
}

// 이벤트 리스너
document.addEventListener('DOMContentLoaded', () => {
    // 기본값 적용
    applyDefaults();

    // 날짜 변경 시 헤더 자동 생성 (헤더가 비어있을 때만)
    document.getElementById('dateInput').addEventListener('change', (e) => {
        const headerInput = document.getElementById('headerInput');
        if (!headerInput.value.trim()) {
            headerInput.value = generateHeaderFromDate(e.target.value);
        }
    });

    // 버튼 이벤트
    document.getElementById('saveDefaultsBtn').addEventListener('click', saveDefaults);
    document.getElementById('resetDefaultsBtn').addEventListener('click', resetDefaults);
    document.getElementById('generateBtn').addEventListener('click', generateContent);
    document.getElementById('copyNewsListBtn').addEventListener('click', copyNewsList);
    document.getElementById('copyKakaoBtn').addEventListener('click', copyKakaoFormat);
    document.getElementById('generatePdfBtn').addEventListener('click', generatePDF);
});

