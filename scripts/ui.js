window.App = window.App || {};

(function() {
  const { Storage, generateId, formatDate } = window.App.Helpers;
  
  // State
  let state = {
    view: 'dashboard', // dashboard, breathe, journal, ai
    breathing: { active: false, phase: 'idle', timer: null },
    journal: Storage.get('app_journal', []),
    favorites: Storage.get('app_favorites', []),
    aiLoading: false
  };

  // Predefined Exercises
  const EXERCISES = [
    { id: 'ex1', title: 'Box Breathing', type: 'breathing', desc: 'Inhale 4s, Hold 4s, Exhale 4s, Hold 4s.', color: 'bg-blue-100' },
    { id: 'ex2', title: '5-Sense Grounding', type: 'mindfulness', desc: 'Acknowledge 5 things you see, 4 you feel...', color: 'bg-green-100' },
    { id: 'ex3', title: 'Body Scan', type: 'meditation', desc: 'Mentally scan your body from toes to head.', color: 'bg-indigo-100' },
    { id: 'ex4', title: 'Gratitude Journaling', type: 'writing', desc: 'Write down three things you are grateful for.', color: 'bg-yellow-100' },
  ];

  /* --- COMPONENT RENDERING --- */

  function renderSidebar() {
    const navItems = [
      { id: 'dashboard', icon: 'LayoutDashboard', label: 'Home' },
      { id: 'breathe', icon: 'Wind', label: 'Breathe' },
      { id: 'journal', icon: 'BookHeart', label: 'Journal' },
      { id: 'ai', icon: 'Bot', label: 'ZenGuide AI' }
    ];

    return navItems.map(item => `
      <button 
        onclick="window.App.navigate('${item.id}')"
        class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${state.view === item.id ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-md' : 'text-[hsl(var(--foreground))] hover:bg-[hsl(var(--primary)/0.1)]'}">
        <i data-lucide="${item.icon}" class="w-5 h-5"></i>
        <span>${item.label}</span>
      </button>
    `).join('');
  }

  function renderDashboard() {
    const lastEntry = state.journal[0];
    return `
      <div class="h-full overflow-y-auto p-6 md:p-10 scroll-smooth">
        <div class="space-y-8 animate-fade-in max-w-5xl mx-auto">
        <header>
          <h2 class="text-3xl font-bold text-[hsl(var(--primary))]">Welcome back</h2>
          <p class="text-[hsl(var(--foreground)/0.7)]">Your peace of mind is a priority today.</p>
        </header>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Quick Action: Breathe -->
          <div class="glass-panel p-6 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer group" onclick="window.App.navigate('breathe')">
            <div class="w-12 h-12 rounded-full bg-[hsl(var(--secondary))] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
               <i data-lucide="Wind" class="text-[hsl(var(--secondary-foreground))]"></i>
            </div>
            <h3 class="text-xl font-semibold mb-2">Take a Breath</h3>
            <p class="text-sm opacity-80">Pause for a moment and center yourself with guided breathing.</p>
          </div>

          <!-- Quick Action: Journal -->
          <div class="glass-panel p-6 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer group" onclick="window.App.navigate('journal')">
            <div class="w-12 h-12 rounded-full bg-[hsl(var(--accent))] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
               <i data-lucide="BookHeart" class="text-[hsl(var(--accent-foreground))]"></i>
            </div>
            <h3 class="text-xl font-semibold mb-2">Mood Journal</h3>
            <p class="text-sm opacity-80">${lastEntry ? `Last entry: ${formatDate(lastEntry.date)}` : 'Record how you feel today.'}</p>
          </div>

          <!-- AI Insight -->
          <div class="glass-panel p-6 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden" onclick="window.App.navigate('ai')">
            <div class="absolute top-0 right-0 p-4 opacity-10">
               <i data-lucide="Sparkles" class="w-24 h-24"></i>
            </div>
            <div class="w-12 h-12 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
               <i data-lucide="Bot" class="text-white"></i>
            </div>
            <h3 class="text-xl font-semibold mb-2">ZenGuide AI</h3>
            <p class="text-sm opacity-80">Get personalized advice or vent to your wellness companion.</p>
          </div>
        </div>

        <!-- Recommended Exercises -->
        <div class="pt-4">
          <h3 class="text-xl font-semibold mb-4">Suggested for You</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${EXERCISES.slice(0,2).map(ex => `
              <div class="flex items-center gap-4 p-4 rounded-xl border border-[hsl(var(--border))] bg-white hover:border-[hsl(var(--primary))] transition-colors">
                <div class="w-12 h-12 rounded-lg ${ex.color} flex items-center justify-center text-[hsl(var(--foreground))]">
                  <i data-lucide="Activity" class="w-6 h-6 opacity-50"></i>
                </div>
                <div>
                  <h4 class="font-medium">${ex.title}</h4>
                  <p class="text-xs opacity-70">${ex.desc}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
      </div>
    `;
  }

  function renderBreathe() {
    return `
      <div class="h-full overflow-y-auto p-6 md:p-10 flex flex-col items-center justify-center">
      <div class="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto">
        <h2 class="text-3xl font-bold mb-8 text-[hsl(var(--primary))]">Box Breathing</h2>
        
        <div class="relative mb-12">
          <!-- Animation Circle -->
          <div id="breathe-circle" class="w-64 h-64 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] opacity-20 transform transition-all duration-[4000ms]"></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <span id="breathe-text" class="text-2xl font-medium text-[hsl(var(--foreground))]">${isRunning ? 'Inhale...' : 'Ready?'}</span>
          </div>
        </div>

        <div class="flex gap-4">
          ${!isRunning ? `
            <button id="start-breathe-btn" class="bg-[hsl(var(--primary))] text-white px-8 py-3 rounded-full text-lg font-medium hover:opacity-90 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Start Session
            </button>
          ` : `
            <button id="stop-breathe-btn" class="bg-[hsl(var(--destructive))] text-white px-8 py-3 rounded-full text-lg font-medium hover:opacity-90 transition-all shadow-lg">
              Stop
            </button>
          `}
        </div>
        <p class="mt-8 text-sm opacity-60 max-w-xs mx-auto">
          Follow the animation: Inhale as it expands, exhale as it contracts. This calms the nervous system.
      </div>
      </div>
      </div>
    `;
  }

  function renderJournal() {
    // Form
    const formHtml = `
      <div class="glass-panel p-6 rounded-2xl mb-8">
        <h3 class="text-lg font-semibold mb-4">New Entry</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">How are you feeling?</label>
            <div class="flex gap-4">
              ${['😔', '😐', '🙂', '😄', '🥰'].map((emoji, idx) => `
                <button class="journal-mood-btn w-10 h-10 text-2xl rounded-full hover:bg-[hsl(var(--primary)/0.2)] transition-colors ${state.journalDraftMood === idx + 1 ? 'bg-[hsl(var(--primary)/0.3)] ring-2 ring-[hsl(var(--primary))]' : ''}" data-val="${idx + 1}">${emoji}</button>
              `).join('')}
            </div>
          </div>
          <textarea id="journal-input" class="w-full p-4 rounded-xl border border-[hsl(var(--border))] bg-white/50 focus:ring-2 focus:ring-[hsl(var(--primary))] outline-none resize-none h-32" placeholder="What's on your mind?..."></textarea>
          <div class="flex justify-end">
            <button id="save-journal-btn" class="bg-[hsl(var(--primary))] text-white px-6 py-2 rounded-lg hover:opacity-90 transition-all shadow-sm">
              Save Entry
            </button>
          </div>
        </div>
      </div>
    `;

    // List
    const listHtml = state.journal.length === 0 ? `
      <div class="text-center py-12 opacity-50">
        <i data-lucide="BookOpen" class="w-12 h-12 mx-auto mb-4"></i>
        <p>Your journal is empty. Start writing today.</p>
      </div>
    ` : `
      <div class="space-y-4">
        ${state.journal.map(entry => `
          <div class="bg-white p-5 rounded-xl border border-[hsl(var(--border))] shadow-sm hover:shadow-md transition-shadow relative group">
            <div class="flex justify-between items-start mb-2">
              <div class="flex items-center gap-2">
                <span class="text-2xl">${['', '😔', '😐', '🙂', '😄', '🥰'][entry.mood] || '😐'}</span>
                <span class="text-xs font-bold uppercase tracking-wider text-[hsl(var(--primary))] opacity-70">${formatDate(entry.date)}</span>
              </div>
              <button class="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity" onclick="window.App.deleteJournal('${entry.id}')">
                <i data-lucide="Trash2" class="w-4 h-4"></i>
              </button>
            </div>
            <p class="text-[hsl(var(--foreground))] whitespace-pre-wrap leading-relaxed">${entry.text}</p>
          </div>
        `).join('')}
      </div>
    `;
    return `
      <div class="h-full overflow-y-auto p-6 md:p-10">
        <div class="max-w-2xl mx-auto animate-fade-in">
      <div class="max-w-2xl mx-auto animate-fade-in">
        <h2 class="text-3xl font-bold mb-6 text-[hsl(var(--primary))]">Mood Journal</h2>
        ${formHtml}
        </div>
      </div>
        ${listHtml}
      </div>
    `;
  }
    return `
      <div class="h-full flex flex-col p-4 md:p-6 animate-fade-in">
        <div class="flex-1 flex flex-col glass-panel rounded-2xl overflow-hidden shadow-sm h-full">
    return `
      <div class="h-[calc(100vh-140px)] flex flex-col glass-panel rounded-2xl overflow-hidden animate-fade-in">
        <div class="bg-[hsl(var(--primary))] text-white p-4 flex justify-between items-center">
          <div class="flex items-center gap-3">
            <i data-lucide="Sparkles" class="w-5 h-5"></i>
            <h3 class="font-semibold">ZenGuide Assistant</h3>
          </div>
          <div id="ai-status" class="text-xs opacity-80 flex items-center gap-2">
            ${state.aiReady ? '<span class="w-2 h-2 bg-green-400 rounded-full"></span> Ready' : '<span class="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span> Loading Model...'} 
            <span id="ai-progress"></span>
          </div>
        </div>
        
        <div id="chat-container" class="flex-1 overflow-y-auto p-4 space-y-4 bg-white/30">
          <!-- Messages go here -->
          <div class="flex gap-3 max-w-[85%]">
             <div class="w-8 h-8 rounded-full bg-[hsl(var(--primary))] flex-shrink-0 flex items-center justify-center text-white"><i data-lucide="Bot" class="w-4 h-4"></i></div>
             <div class="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm text-sm leading-relaxed">
               Hello. I am here to listen and offer gentle guidance. How are you feeling right now?
             </div>
          </div>
        </div>

        <div class="p-4 bg-white border-t border-[hsl(var(--border))]">
          <div class="flex gap-2 relative">
            <input id="ai-input" type="text" class="flex-1 p-3 pr-12 rounded-xl border border-[hsl(var(--border))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]" placeholder="Type a message..." ${!state.aiReady ? 'disabled' : ''}>
            <button id="ai-send-btn" class="absolute right-2 top-2 p-1.5 bg-[hsl(var(--primary))] text-white rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed" ${!state.aiReady ? 'disabled' : ''}>
              <i data-lucide="Send" class="w-4 h-4"></i>
            </button>
            <button id="ai-stop-btn" class="hidden absolute right-12 top-2 p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
              <i data-lucide="Square" class="w-4 h-4 fill-current"></i>
        </div>
      </div>
          </div>
        </div>
      </div>
    `;
  }

  /* --- LOGIC & HANDLERS --- */

  function init() {
    // Load view
    render();
    
    // Auto-load AI if on AI tab, otherwise wait
    if (state.view === 'ai') loadAI();
  }

  function loadAI() {
    if (state.aiReady || state.aiLoading) return;
    state.aiLoading = true;
    
    window.AppLLM.load(null, (percent) => {
      $('#ai-progress').text(`${percent}%`);
    }).then(() => {
      state.aiReady = true;
      state.aiLoading = false;
      render(); // Re-render to enable inputs
    }).catch(err => {
      console.error(err);
      $('#ai-status').html(`<span class="text-red-200">Error: WebGPU needed</span>`);
  function navigate(viewId) {
    state.view = viewId;
    if (viewId === 'ai') loadAI();
    
    // Close sidebar on mobile
    if (window.innerWidth < 768) {
      window.App.toggleSidebar(false);
    }
    
    render();
    state.view = viewId;
    if (viewId === 'ai') loadAI();
    render();
  }

  function render() {
    const $app = $('#app-content');
    const $nav = $('#app-nav');
    
    // Update Nav
    $nav.html(renderSidebar());
    lucide.createIcons();

    // Update Content
    let content = '';
    if (state.view === 'dashboard') content = renderDashboard();
    else if (state.view === 'breathe') content = renderBreathe();
    else if (state.view === 'journal') content = renderJournal();
    else if (state.view === 'ai') content = renderAI();
    
    $app.html(content);
    lucide.createIcons();
    attachEvents();
  }

  function attachEvents() {
    // Breathing
    $('#start-breathe-btn').on('click', startBreathing);
    $('#stop-breathe-btn').on('click', stopBreathing);

    // Journal
    $('.journal-mood-btn').on('click', function() {
      state.journalDraftMood = parseInt($(this).data('val'));
      render(); // sloppy re-render but works for this scale to show selection state
      // Restore text
      $('#journal-input').val(state.journalDraftText || '');
      $('#journal-input').focus();
    });
    
    $('#journal-input').on('input', function() {
      state.journalDraftText = $(this).val();
    });

    $('#save-journal-btn').on('click', function() {
      const text = $('#journal-input').val();
      const mood = state.journalDraftMood || 3;
      if (!text.trim()) return alert('Please write something first.');
      
      const entry = { id: generateId(), date: new Date().toISOString(), mood, text };
      state.journal.unshift(entry);
      Storage.set('app_journal', state.journal);
      
      // Reset draft
      state.journalDraftText = '';
      state.journalDraftMood = 3;
      
      // Toast
      showToast('Entry saved to journal');
      render();
    });

    // AI
    $('#ai-input').on('keypress', (e) => {
      if (e.which === 13) sendMessage();
    });
    $('#ai-send-btn').on('click', sendMessage);
    $('#ai-stop-btn').on('click', () => {
      window.AppLLM.stop();
      $('#ai-send-btn').show();
      $('#ai-stop-btn').addClass('hidden');
    });
  }

  /* --- BREATHING LOGIC --- */
  let breatheInterval;
  function startBreathing() {
    state.breathing.active = true;
    render();
    
    const $text = $('#breathe-text');
    const $circle = $('#breathe-circle');
    
    let phase = 0; // 0=in, 1=hold, 2=out, 3=hold
    const runCycle = () => {
      if (!state.breathing.active) return;
      
      if (phase === 0) {
        $text.text('Inhale...');
        $circle.css('transform', 'scale(1.5)');
        $circle.css('opacity', '0.8');
        setTimeout(() => { phase = 1; runCycle(); }, 4000);
      } else if (phase === 1) {
        $text.text('Hold');
        setTimeout(() => { phase = 2; runCycle(); }, 4000);
      } else if (phase === 2) {
        $text.text('Exhale...');
        $circle.css('transform', 'scale(1.0)');
        $circle.css('opacity', '0.2');
        setTimeout(() => { phase = 3; runCycle(); }, 4000);
      } else if (phase === 3) {
        $text.text('Hold');
        setTimeout(() => { phase = 0; runCycle(); }, 4000);
      }
    };
    
    runCycle();
  }

  function stopBreathing() {
    state.breathing.active = false;
    render();
  }

  /* --- AI LOGIC --- */
  async function sendMessage() {
    const $input = $('#ai-input');
    const text = $input.val().trim();
    if (!text) return;
    
    $input.val('');
    $('#chat-container').append(`
      <div class="flex gap-3 max-w-[85%] ml-auto justify-end">
         <div class="bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] p-3 rounded-2xl rounded-tr-none shadow-sm text-sm leading-relaxed">
           ${text}
         </div>
      </div>
    `);
    
    const $replyContainer = $(`
      <div class="flex gap-3 max-w-[85%]">
         <div class="w-8 h-8 rounded-full bg-[hsl(var(--primary))] flex-shrink-0 flex items-center justify-center text-white"><i data-lucide="Bot" class="w-4 h-4"></i></div>
         <div class="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm text-sm leading-relaxed ai-response"></div>
      </div>
    `);
    $('#chat-container').append($replyContainer);
    
    const $responseBody = $replyContainer.find('.ai-response');
    const $scroll = $('#chat-container');
    $scroll.scrollTop($scroll[0].scrollHeight);

    $('#ai-send-btn').hide();
    $('#ai-stop-btn').removeClass('hidden').show();

    let fullResponse = '';
    try {
      await window.AppLLM.generate(text, {
        system: 'You are ZenGuide, a compassionate, calm, and supportive wellness assistant. Keep answers concise, soothing, and helpful.',
        onToken: (token) => {
          fullResponse += token;
          $responseBody.text(fullResponse);
          $scroll.scrollTop($scroll[0].scrollHeight);
        }
      });
    } catch (e) {
      $responseBody.text('Error generating response. Please try again.');
    } finally {
      $('#ai-send-btn').show();
      $('#ai-stop-btn').addClass('hidden');
    }
  }

  // Toasts
  function showToast(msg) {
    const $toast = $(`<div class="fixed bottom-4 right-4 bg-[hsl(var(--foreground))] text-[hsl(var(--background))] px-6 py-3 rounded-xl shadow-xl z-50 animate-bounce-in">${msg}</div>`);
    $('body').append($toast);
    setTimeout(() => $toast.fadeOut(300, () => $toast.remove()), 3000);
  }

  // Expose
  window.App.toggleSidebar = (force) => {
    const $sidebar = $('#main-sidebar');
    if (typeof force === 'boolean') {
      if (force) $sidebar.removeClass('-translate-x-full');
      else $sidebar.addClass('-translate-x-full');
    } else {
      $sidebar.toggleClass('-translate-x-full');
    }
  };
  window.App.init = init;
  window.App.render = render;
  window.App.navigate = navigate;
  window.App.deleteJournal = (id) => {
    if(!confirm('Delete this entry?')) return;
    state.journal = state.journal.filter(e => e.id !== id);
    Storage.set('app_journal', state.journal);
    render();
  };

})();