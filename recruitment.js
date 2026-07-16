(() => {
  const today = () => new Date().toISOString().slice(0, 10);
  const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const safeUrl = value => /^https?:\/\//i.test(String(value || '')) ? String(value) : '';
  const urlLink = (url, label) => {
    const href = safeUrl(url);
    return href ? `<a class="secondary-btn" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>` : '';
  };

  const recruitmentData = {
    mercari: {status:'open',label:'募集中',category:'本選考',deadline:'2026-08-31',nextDeadline:'2026-08-31',stages:['ES提出','適性検査','一次面接','最終面接'],applicationUrl:'https://example.com/codra-demo/mercari/apply',requirementsUrl:'https://example.com/codra-demo/mercari/requirements',officialRecruitUrl:'https://example.com/codra-demo/mercari/careers',sourceName:'企業公式採用ページ（サンプル）',sourceUrl:'https://example.com/codra-demo/mercari/careers',checkedAt:'2026-07-16',openings:[{name:'新卒総合職',category:'本選考',deadline:'2026-08-31'}]},
    recruit: {status:'open',label:'募集中',category:'本選考',deadline:'2026-07-24',nextDeadline:'2026-07-24',stages:['ES提出','Webテスト','複数回面接','最終面接'],applicationUrl:'https://example.com/codra-demo/recruit/apply',requirementsUrl:'https://example.com/codra-demo/recruit/requirements',officialRecruitUrl:'https://example.com/codra-demo/recruit/careers',sourceName:'企業公式採用ページ（サンプル）',sourceUrl:'https://example.com/codra-demo/recruit/careers',checkedAt:'2026-07-16',openings:[{name:'ビジネス職',category:'本選考',deadline:'2026-07-24'}]},
    layerx: {status:'checking',label:'情報確認中',category:'本選考',deadline:null,nextDeadline:null,stages:['エントリー','面接','最終面接'],applicationUrl:'https://example.com/codra-demo/layerx/apply',requirementsUrl:'https://example.com/codra-demo/layerx/requirements',officialRecruitUrl:'https://example.com/codra-demo/layerx/careers',sourceName:'サンプル情報（公式確認待ち）',sourceUrl:'https://example.com/codra-demo/layerx/careers',checkedAt:'2026-07-16',openings:[]},
    dentsu: {status:'preopen',label:'募集開始前',category:'本選考',deadline:'2026-09-01',nextDeadline:'2026-09-01',stages:['エントリー','ES提出','面接'],applicationUrl:'https://example.com/codra-demo/dentsu/apply',requirementsUrl:'https://example.com/codra-demo/dentsu/requirements',officialRecruitUrl:'https://example.com/codra-demo/dentsu/careers',sourceName:'サンプル情報（募集開始前の想定）',sourceUrl:'https://example.com/codra-demo/dentsu/careers',checkedAt:'2026-07-16',openings:[{name:'ビジネス職',category:'本選考',deadline:'2026-09-01'}]},
    sony: {status:'open',label:'募集中',category:'インターン',deadline:'2026-07-20',nextDeadline:'2026-07-20',stages:['エントリー','ES提出','適性検査'],applicationUrl:'https://example.com/codra-demo/sony/apply',requirementsUrl:'https://example.com/codra-demo/sony/requirements',officialRecruitUrl:'https://example.com/codra-demo/sony/careers',sourceName:'サンプル情報（公式確認待ち）',sourceUrl:'https://example.com/codra-demo/sony/careers',checkedAt:'2026-07-16',openings:[{name:'夏季インターン',category:'インターン',deadline:'2026-07-20'}]}
  };
  Object.entries(recruitmentData).forEach(([id, recruitment]) => { const target = company(id); if (target) target.recruitment = recruitment; });

  const normalizedRecruitment = c => {
    const data = c?.recruitment;
    if (!data || typeof data !== 'object') return {status:'checking',label:'情報確認中',category:'その他',deadline:null,nextDeadline:null,stages:[],openings:[],checkedAt:null};
    const deadline = data.deadline && data.deadline < today() ? null : data.deadline;
    if (data.deadline && data.deadline < today()) return {...data,status:'closed',label:'受付終了',deadline:data.deadline,openings:[]};
    return {...data,deadline};
  };
  const daysUntil = date => date ? Math.ceil((new Date(`${date}T23:59:59`) - new Date()) / 86400000) : null;
  const deadlineText = date => date ? new Date(`${date}T00:00:00`).toLocaleDateString('ja-JP',{year:'numeric',month:'long',day:'numeric'}) : '未確認';
  const recruitmentTone = status => status === 'open' ? 'open' : status === 'closed' ? 'closed' : status === 'preopen' ? 'preopen' : 'checking';
  const recruitmentBadge = c => { const r = normalizedRecruitment(c); return `<span class="tag recruitment-badge ${recruitmentTone(r.status)}" data-recruitment-status="${escapeHtml(r.status)}">${escapeHtml(r.label)}</span>`; };
  const deadlineClass = date => daysUntil(date) !== null && daysUntil(date) <= 7 ? 'deadline-warning' : 'deadline-normal';
  const deadlineValue = date => date ? `<span class="${deadlineClass(date)}">${escapeHtml(deadlineText(date))}</span>` : '<span class="deadline-normal">情報確認中</span>';

  function recruitmentMini(c) {
    const r = normalizedRecruitment(c);
    return `<div class="recruitment-mini"><div class="recruitment-mini-row"><span>募集状況</span>${recruitmentBadge(c)}</div><div class="recruitment-mini-row"><span>次回締切</span><span class="${deadlineClass(r.nextDeadline)}">${r.nextDeadline ? escapeHtml(deadlineText(r.nextDeadline)) : '未確認'}</span></div><div class="recruitment-actions">${urlLink(r.applicationUrl,'応募ページを見る')}<button class="secondary-btn" data-recruitment-detail="${escapeHtml(c.id)}">選考情報を見る</button></div></div>`;
  }

  function recruitmentSelectionHtml(c) {
    const r = normalizedRecruitment(c);
    const openings = Array.isArray(r.openings) ? r.openings : [];
    return `<div class="grid grid-2"><div class="card recruitment-summary"><div class="recruitment-header"><h3>現在の募集状況</h3>${recruitmentBadge(c)}</div><div class="recruitment-meta"><div><small>募集状況</small><strong>${escapeHtml(r.label)}</strong></div><div><small>選考区分</small><strong>${escapeHtml(r.category)}</strong></div><div><small>応募締切</small><strong>${deadlineValue(r.deadline)}</strong></div><div><small>次回締切</small><strong>${deadlineValue(r.nextDeadline)}</strong></div></div>${openings.length ? `<h3>募集中の選考一覧</h3><div class="selection-list">${openings.map(item=>`<div class="selection-row"><div><strong>${escapeHtml(item.name || '選考情報')}</strong><small>${escapeHtml(item.category || r.category)} · 締切 ${escapeHtml(deadlineText(item.deadline))}</small></div>${recruitmentBadge(c)}</div>`).join('')}</div>` : `<div class="recruitment-empty">現在表示できる募集要項はありません。情報確認中のため、公式採用ページで最新情報を確認してください。</div>`}</div><div class="card recruitment-summary"><h3>選考ステップ</h3>${r.stages.length ? `<div class="recruitment-stages">${r.stages.map((stage,index)=>`<span class="chip">${index+1}. ${escapeHtml(stage)}</span>`).join('')}</div>` : '<div class="recruitment-empty">選考ステップは情報確認中です。</div>'}<h3 style="margin-top:24px">応募・公式リンク</h3><div class="recruitment-links">${urlLink(r.applicationUrl,'応募ページを見る')}${urlLink(r.requirementsUrl,'募集要項を見る')}${urlLink(r.officialRecruitUrl,'企業公式採用ページ')}</div><div class="recruitment-source"><strong>情報ソース：</strong>${escapeHtml(r.sourceName || '確認中')}<br><strong>情報の確認日：</strong>${escapeHtml(r.checkedAt || '未確認')}<br><span>リンク先はデモ用サンプルです。実際の応募はできません。</span></div></div></div><div class="notice">企業の募集状況はサンプル情報です。締切・募集条件は変わる可能性があるため、応募前に必ず企業公式サイトで最新情報を確認してください。</div>`;
  }

  function codraRecruitmentCard(c) {
    const s = c.scores || scores(c), r = c.rec || recommendation(c);
    return `<article class="card company-card" data-testid="recruitment-card" data-recruitment-card="${escapeHtml(c.id)}"><div class="company-top"><div class="company-brand">${logo(c)}<div><div class="company-name">${escapeHtml(c.name)}</div><div class="company-meta">${escapeHtml(c.category)} · ${escapeHtml(c.companySize)}</div></div></div><div class="card-actions">${dataBadge('sample')}<label class="compare-check"><input type="checkbox" data-compare="${escapeHtml(c.id)}" ${state.compareIds.includes(c.id)?'checked':''}/> 比較</label><button class="save-btn ${state.saved.has(c.id)?'saved':''}" data-save="${escapeHtml(c.id)}" aria-label="${state.saved.has(c.id)?'保存を解除':'企業を保存'}">${state.saved.has(c.id)?'♥':'♡'}</button></div></div><div class="score-row"><div><div class="score">${s.total}<small> / 100</small></div><div class="company-meta">総合適合度</div></div><span class="tag ${s.total>=80?'tag-green':s.total>=60?'tag-blue':'tag-amber'}">${escapeHtml(c.classification||classify(s.total))}</span></div><div class="score-bar"><i style="width:${s.total}%"></i></div>${recruitmentMini(c)}<p class="reason">${escapeHtml(r.main)}</p><div class="recommend-details"><strong>共通点</strong><span>${escapeHtml(r.matches.join(' / '))}</span><strong>注意点</strong><span>${escapeHtml(r.cautions.join(' / '))}</span><strong>伸ばす要素</strong><span>${escapeHtml(r.next.join(' / '))}</span></div><button class="link-btn detail-link" data-company="${escapeHtml(c.id)}">推薦理由と企業情報を見る →</button></article>`;
  }

  const recruitmentPriority = c => { const status = normalizedRecruitment(c).status; return status === 'open' ? 0 : status === 'checking' ? 1 : status === 'preopen' ? 2 : 3; };
  const rankedWithRecruitment = () => ranked().sort((a,b) => recruitmentPriority(a)-recruitmentPriority(b) || b.scores.total-a.scores.total);
  const upcomingRecruitments = () => rankedWithRecruitment().filter(c => ['open','preopen'].includes(normalizedRecruitment(c).status) && normalizedRecruitment(c).nextDeadline).sort((a,b) => normalizedRecruitment(a).nextDeadline.localeCompare(normalizedRecruitment(b).nextDeadline));

  function codraDashboard() {
    const list = rankedWithRecruitment(), pc = completion(), first = !state.profile.registered, recruitList = upcomingRecruitments();
    const appTasks = state.apps.map((a,i) => { const c = company(a.company); return c ? `<div class="task ${state.doneTasks.has(i)?'done':''}"><button class="task-check" data-task="${i}">${state.doneTasks.has(i)?'✓':''}</button><div><div class="task-title">${escapeHtml(a.next)}</div><div class="task-sub">${escapeHtml(c.name)} · あなたの選考 · 締切 ${escapeHtml(a.deadline || '未設定')}</div></div><span class="task-priority">優先度 ${escapeHtml(a.priority || '中')}</span></div>` : ''; }).join('');
    const recruitmentTasks = recruitList.slice(0,3).map(c => { const r = normalizedRecruitment(c); return `<div class="task"><span class="task-check" aria-hidden="true">!</span><div><div class="task-title">${escapeHtml(c.name)}の${escapeHtml(r.category)}に応募準備</div><div class="task-sub">企業募集 · 次回締切 ${escapeHtml(deadlineText(r.nextDeadline))}</div></div><span class="task-priority ${deadlineClass(r.nextDeadline)}">企業募集中</span></div>`; }).join('');
    const deadlineRows = recruitList.slice(0,4).map(c => { const r = normalizedRecruitment(c); return `<div class="deadline"><div><div class="deadline-title">${escapeHtml(c.name)}</div><div class="deadline-company">企業募集：${escapeHtml(r.category)} ${recruitmentBadge(c)}</div></div><div class="date ${daysUntil(r.nextDeadline) <= 7 ? '' : 'normal'}">${escapeHtml(r.nextDeadline.slice(5).replace('-','/'))}<small> 締切</small></div></div>`; }).join('');
    layout(`<section class="hero"><div><div class="eyebrow">Your career strategy</div><h1>${first?'Codraを始めましょう。':`こんにちは、${userName()}さん。`}</h1><p>${first?'プロフィールを登録すると、あなた向けの企業と準備方法を提案できます。':'今日も、自分らしいキャリアを一歩ずつ設計しましょう。'}</p></div><div class="hero-side"><div><div class="stat-label">プロフィール完成度</div><div class="stat-value">${pc}<small>%</small></div></div><div class="progress-ring" style="background:conic-gradient(var(--green) ${pc}%,#e8edf3 0)"><span>${pc}%</span></div></div></section>${first?emptyStart():''}${readinessHtml()}<div class="notice source-notice">企業情報・選考情報はサンプルです。応募や面接準備の前に、必ず企業公式サイトで最新情報を確認してください。</div><div class="grid grid-4"><div class="card stat-card"><div class="stat-label">就活進捗率</div><div class="stat-value">38<small>%</small></div><div class="stat-foot">↑ 先週より 8%</div></div><div class="card stat-card"><div class="stat-label">保存した企業</div><div class="stat-value">${state.saved.size}<small> 社</small></div><div class="stat-foot">${state.saved.size?'自分のデータ':'まず企業を保存しましょう'}</div></div><div class="card stat-card"><div class="stat-label">選考中の企業</div><div class="stat-value">${state.apps.length}<small> 社</small></div><div class="stat-foot">${state.apps.length?'次のアクションがあります':'応募後に登録できます'}</div></div><div class="card stat-card"><div class="stat-label">ES・面接対策</div><div class="stat-value">${state.esDocs.length+userCounts().answers}<small> 件</small></div><div class="stat-foot">自分のデータ</div></div></div><div class="grid grid-2"><div><div class="section-head"><div><h2>今日やるべきこと</h2><p>あなたの選考状況と企業募集の締切を分けて表示</p></div><button class="link-btn" data-view="saved">すべて見る</button></div><div class="card">${appTasks}${recruitmentTasks || '<div class="empty compact-empty"><strong>企業募集の締切はありません</strong>企業を探す画面で最新の募集情報を確認できます。</div>'}</div></div><div><div class="section-head"><div><h2>締切が近い企業</h2><p>7日以内の締切は注意表示</p></div><button class="link-btn" data-view="saved">選考管理</button></div><div class="card">${deadlineRows || '<div class="empty compact-empty"><strong>締切情報はありません</strong>情報確認中の企業は公式サイトで確認してください。</div>'}</div></div></div><div class="section-head"><div><h2>あなた向けおすすめ企業</h2><p>${first?'プロフィール作成後にあなた向けへ更新されます':'プロフィールと重視度から再計算した現時点の仮説'}</p></div><div class="section-actions"><button class="secondary-btn" id="recalculate">↻ 再計算する</button><button class="link-btn" data-view="discover">企業を探す →</button></div></div><div class="grid grid-3">${list.slice(0,3).map(codraRecruitmentCard).join('')}</div></div>`);
    if (first) app.insertAdjacentHTML('afterbegin', '<div class="welcome-card"><div class="eyebrow">Welcome to Codra</div><h2>あなたの就活軸から、狙う企業と準備タスクを整理します。</h2><div class="value-points"><span><b>01</b>自分に合う企業が分かる</span><span><b>02</b>選考準備の抜け漏れが減る</span><span><b>03</b>ESと面接の改善点が分かる</span></div><div class="section-actions"><button class="primary-btn" data-start-onboarding>プロフィールを作成する</button><button class="secondary-btn" id="start-demo">デモを始める</button></div></div>');
    const guide = typeof demoGuide === 'function' ? demoGuide() : '';
    if (guide) app.insertAdjacentHTML('afterbegin', guide);
    bind();
  }

  function codraDiscover() {
    const list = rankedWithRecruitment().filter(c => (state.filter === 'すべて' || c.category.includes(state.filter) || c.companySize.includes(state.filter)) && c.name.toLowerCase().includes(state.query.toLowerCase()));
    layout(`<div class="eyebrow">Discover your fit</div><h1 class="page-title">企業を探す</h1><p class="page-desc">知名度だけでは見つからない、あなたに合う選択肢を見つけましょう。</p><div class="searchbar"><input class="input" id="company-search" value="${escapeHtml(state.query)}" placeholder="企業名・キーワードで検索"/><button class="primary-btn" id="search-btn">検索する</button></div><div class="filter-row">${['すべて','IT・Web','人材・メディア','広告代理店','金融','メーカー・IT','ベンチャー企業','大手企業'].map(f=>`<button class="filter-pill ${state.filter===f?'active':''}" data-filter="${escapeHtml(f)}">${escapeHtml(f)}</button>`).join('')}</div><div class="section-head"><div><h2>${list.length}社の企業</h2><p>サンプル情報 · 2026年7月16日時点 · 正式情報は企業公式サイトで確認してください</p></div><button class="secondary-btn" id="compare-btn">比較リスト（${state.compareIds.length}/3）</button></div><div class="grid grid-3">${list.length?list.map(codraRecruitmentCard).join(''):`<div class="card empty"><strong>条件に一致する企業がありません</strong>検索条件を少しゆるめてみましょう。</div>`}</div>`);
  }

  function codraDetail() {
    const c = company(state.companyId);
    if (!c) { state.view = 'discover'; return render(); }
    const s = scores(c), r = recommendation(c,s);
    let body;
    if (state.tab === 'why') body = `<div class="card"><h3>なぜおすすめなのか</h3><p class="reason">${escapeHtml(r.main)}</p><h3>あなたとの共通点</h3><ul class="bullet-list">${r.matches.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul><h3>注意すべき点</h3><ul class="bullet-list">${r.cautions.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul><h3>内定に向けて伸ばす要素</h3><ul class="bullet-list">${r.next.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul></div>`;
    else if (state.tab === 'selection') body = recruitmentSelectionHtml(c);
    else if (state.tab === 'interview') body = `<div class="card"><h3>面接対策</h3><p class="reason">${escapeHtml(c.name)}向けの想定質問と回答メモを準備できます。</p><button class="primary-btn" data-interview-company="${escapeHtml(c.id)}">面接対策を開く</button></div>`;
    else if (state.tab === 'work') body = `<div class="card"><h3>働き方・キャリア</h3><div class="table-card"><table class="compare-table"><tbody>${[['勤務地',c.locations.join(' / ')],['身につくスキル',c.requiredSkills.join(' / ')],['3年後のキャリア','プロジェクトリード / 専門性の確立'],['5年後のキャリア','事業責任者 / 新規事業への挑戦']].map(x=>`<tr><td>${escapeHtml(x[0])}</td><td>${escapeHtml(x[1])}</td></tr>`).join('')}</tbody></table></div></div>`;
    else body = `<div class="grid grid-2"><div class="card"><h3>事業概要</h3><p class="reason">${escapeHtml(c.detail)}</p><div class="chip-list"><span class="chip">${escapeHtml(c.locations.join(' / '))}</span><span class="chip">初任給 ${escapeHtml(c.salary)}万円〜</span></div></div><div class="card"><h3>あなたとの適合度</h3><div class="metric-list" style="margin-top:18px">${[['業界適合度',s.industry],['職種適合度',s.job],['働き方適合度',s.work],['スキル適合度',s.skill]].map(([x,v])=>`<div class="metric"><span>${escapeHtml(x)}</span><div class="score-bar"><i style="width:${v}%"></i></div><b>${v}</b></div>`).join('')}</div></div></div>`;
    const recruitment = normalizedRecruitment(c);
    layout(`<button class="back" data-view="discover">← 企業を探すへ戻る</button><div class="detail-head">${logo(c)}<div><h1>${escapeHtml(c.name)}</h1><div class="company-meta">${escapeHtml(c.category)} · サンプル企業情報</div></div><button class="primary-btn" data-save="${escapeHtml(c.id)}">${state.saved.has(c.id)?'保存済み':'企業を保存'}</button></div><div class="notice">${dataBadge('sample')} 企業・選考情報はサンプルです。情報確認日：${escapeHtml(recruitment.checkedAt || '未確認')}。応募前に公式サイトで最新情報を確認してください。</div><div class="tabs">${[['overview','概要'],['why','おすすめ理由'],['work','事業・職種 / 働き方'],['selection','選考情報'],['interview','面接対策']].map(([t,x])=>`<button class="tab ${state.tab===t?'active':''}" data-tab="${t}">${x}</button>`).join('')}</div>${body}`);
  }

  const originalBind = window.bind;
  window.bind = function() {
    originalBind();
    document.querySelectorAll('[data-recruitment-detail]').forEach(button => button.onclick = () => { state.companyId = button.dataset.recruitmentDetail; state.view = 'detail'; state.tab = 'selection'; render(); });
  };
  window.card = codraRecruitmentCard;
  window.dashboard = codraDashboard;
  window.discover = codraDiscover;
  window.detail = codraDetail;

  // Refresh once so the first page also receives recruitment fields.
  if (typeof window.render === 'function') window.render();
})();
