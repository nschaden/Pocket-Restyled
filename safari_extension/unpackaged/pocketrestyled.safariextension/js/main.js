/* Pocket Restyled - main
 *
 * Simple keyboard navigation on Instapaper list and individual text pages.
 *
 * Applicable patterns:
 * all of getpocket.com
 */

jQuery.noConflict();

Pocket = 
{
  list: null,
  active: null,
  activeIndex: 0,
  // scroll the viewport one screen forward or back
  scrollOneScreen: function(forward)
  {
    var wheight = jQuery(window).height() - 110;
    var speed = 400;
    if (forward)
      jQuery('body').animate({'scrollTop':'+=' + wheight + 'px'},speed);
    else
      jQuery('body').animate({'scrollTop':'-=' + wheight + 'px'},speed);
  },
  // check if the currently selected item is in visible viewport
  checkActiveForScroll: function(jumpscroll)
  {
    if (!Pocket.active.length) return;
    var scrollbottom = jQuery('body').scrollTop() + jQuery(window).height();
    if (jumpscroll)
    {
      // the item is in the viewport, so don't scroll
      if ((Pocket.active.offset().top+Pocket.active.height()/3) <= (scrollbottom - 45)) return;
      var newposition = (Pocket.active.offset().top+Pocket.active.height()/3) - 200;
      jQuery('body').scrollTop(newposition); 
    }
    else
    {
      if ((Pocket.active.offset().top+Pocket.active.height()/3) > (scrollbottom - 45))
      {
        Pocket.scrollOneScreen(true);
      }
      if ((Pocket.active.offset().top+Pocket.active.height()/3) < (jQuery('body').scrollTop() + 65))
      {
        Pocket.scrollOneScreen(false);
      }
    }
  },
  showHelpOverlay: function()
  {
    if (!jQuery('#help_overlay').length)
    {
      var screentext = '<div id="help_screen"></div>';
      var windowtext = '<div id="help_overlay"><h2>Pocket Restyled: keyboard shortcuts</h2><ul>';
      windowtext += '<li><h3>Global</h3></li>';
      windowtext += '<li><span>a:</span>Jump to archive section</li>';
      windowtext += '<li><span>s:</span>Jump to starred/favorites section</li>';
      windowtext += '<li><span>u:</span>Jump to unread/home section</li>';
      windowtext += '<li><span>?:</span>Open/close keyboard shortcuts overlay</li>';
      windowtext += '<li><h3>Home/Favorites/Archive</h3></li>';
      windowtext += '<li><span>1:</span>Switch to tile view</li>';
      windowtext += '<li><span>2:</span>Switch to list view</li>';
      windowtext += '<li><span>j:</span>Move list selection one item forward</li>';
      windowtext += '<li><span>k:</span>Move list selection one item back</li>';
      windowtext += '<li><span>o:</span>Open selected item (also return/enter)</li>';
      windowtext += '<li><h3>Reading mode</h3></li>';
      windowtext += '<li><span>f:</span>Toggle full screen mode</li>';
      windowtext += '<li><span>v:</span>Open selected item in new window/tab</li></ul></div>';
      jQuery('body').append(jQuery(screentext));
      jQuery('body').append(jQuery(windowtext));
      jQuery('#help_screen,#help_overlay').click(function()
      {
        Pocket.closeHelpOverlay();
      });
    }
    jQuery('#help_screen').css({'height':Math.max(jQuery(window).height(),jQuery('#container').height()) + 'px'});
    jQuery('#help_overlay').css({'top':jQuery('body').scrollTop() + 100 + 'px','left':jQuery(window).width()/2 - 246 + 'px'});
    jQuery('#help_screen,#help_overlay').fadeIn(500);
  },
  closeHelpOverlay: function()
  {
    if (!jQuery('#help_overlay').length) return;
    jQuery('#help_screen,#help_overlay').fadeOut(400);
  },
  jumpToLocation: function(newhref)
  {
    if (document.location.href != newhref && document.location.href != ('http://getpocket.com' + newhref))
    {
      document.location.href = newhref;
    }
  },
  resetActiveItem: function()
  {
    Pocket.active = Pocket.list.children('li:first');
    Pocket.activeIndex = 0;
  },
  // move forward or back one item in the list 
  moveActiveItem: function(forward)
  {
    if (Pocket.list !== null && Pocket.active !== null)
    {
      if ((forward && Pocket.active.next().length) ||
          (!forward && Pocket.active.prev().length))
      {
        if (forward)
        {
          nextactive = Pocket.active.next();
          if (!nextactive.is(':visible'))
          {
            if (nextactive.next().length)
            {
              nextactive = nextactive.next();
              if (!nextactive.is(':visible'))
                return;
              else
                Pocket.activeIndex++;
            }
            else
              return;
          }
          else 
            Pocket.activeIndex++;
        }
        else
        {
          nextactive = Pocket.active.prev();
          if (!nextactive.is(':visible'))
          {
            if (nextactive.next().length)
            {
              nextactive = nextactive.prev();
              if (!nextactive.is(':visible'))
                return;
              else
                Pocket.activeIndex++;
            }
            else
              return;
          }
          else 
            Pocket.activeIndex--;
        }
        Pocket.active.removeClass('active');
        nextactive.addClass('active');
        Pocket.active = nextactive;
        if (typeof(localStorage) == 'object')
          localStorage.setItem('pocket_activeindex',Pocket.activeIndex);
        Pocket.checkActiveForScroll();
      }
    }
  },
  readActiveItem: function()
  {
    if (!Pocket.active) return;
    var targetlink = Pocket.active.find('.link');
    targetlink.trigger('click');
    var targethref = Pocket.active.find('.link').attr('href');
    localStorage.setItem('pocket_activeindex',Pocket.activeIndex);
    // following default behavior: articles parsed as text should open in same tab, otherwise new tab
    if (targethref.indexOf('/a/read/') > -1)
      Pocket.jumpToLocation(targethref);
    else
      window.open(targethref);
  },
  showHeaderFooter: function()
  {
    jQuery('#PKT_header,.nav,#subnav,#queue_title').show();
  },
  toggleHeaderFooter: function()
  {
    if (document.location.href.indexOf('/a/read/') == -1) return;
    var headerfooter = jQuery('#PKT_header,.nav,#subnav');
    if (jQuery('.nav').is(':visible'))
      headerfooter.fadeOut(200);
    else
      headerfooter.fadeIn(200);
  },
  // capture core keyboard input
  keyCheck: function(e)
  {
    // for 1, switch view to tile view if avaiable 
    if (!e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey && e.keyCode == 49)
    {
      e.preventDefault();
      var button = jQuery('#pagenav_grid');
      if (button.length) {
        Pocket.jumpToLocation(button.children('a').attr('href'));
      }
    }
    // for 2, switch view to list view if available
    if (!e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey && e.keyCode == 50)
    {
      e.preventDefault();
      var button2 = jQuery('#pagenav_list');
      if (button2.length) {
        Pocket.jumpToLocation(button2.children('a').attr('href'));
      }
    }
    // for a, jump to archive section
    if (!e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey && e.keyCode == 97)
    {
      e.preventDefault();
      if (typeof localStorage == 'object' && document.location.href.indexOf('/read') > -1)
        localStorage.setItem('pocket_fromreadarticle','1');
      var basehref = 'http://getpocket.com/a/archive/';
      if (typeof localStorage == 'object' && localStorage.getItem('pocket_latestqueueview') == 'list')
        Pocket.jumpToLocation(basehref + 'list/');
      else
        Pocket.jumpToLocation(basehref);
    }
    // for f, toggle full screen mode
    if (!e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey && e.keyCode == 102)
    {
      e.preventDefault();
      Pocket.toggleHeaderFooter();
    }
    // for j, jump forward one selected item in the list
    if (!e.altKey && !e.ctrlKey && !e.metaKey && e.keyCode == 106)
    {
      e.preventDefault();
      Pocket.moveActiveItem(true);
    }
    // for k, jump back one selected item in the list
    if (!e.altKey && !e.ctrlKey && !e.metaKey && e.keyCode == 107)
    {
      e.preventDefault();
      Pocket.moveActiveItem(false);
    }
    // for o or return/enter, jump to read version of the selected item
    if (!e.altKey && !e.ctrlKey && !e.metaKey && (e.keyCode == 111 || e.keyCode == 13))
    {
      e.preventDefault();
      Pocket.readActiveItem();
    }
    // for s, jump to starred/favorites
    if (!e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey && e.keyCode == 115)
    {
      e.preventDefault();
      if (typeof localStorage == 'object' && document.location.href.indexOf('/read') > -1)
        localStorage.setItem('pocket_fromreadarticle','1');
      var basehref2 = 'http://getpocket.com/a/favorites/';
      if (typeof localStorage == 'object' && localStorage.getItem('pocket_latestqueueview') == 'list')
        Pocket.jumpToLocation(basehref2 + 'list/');
      else
        Pocket.jumpToLocation(basehref2);
    }
    // for u, jump to unread/home/queue section
    if (!e.altKey && !e.ctrlKey && !e.metaKey && e.keyCode == 117)
    {
      e.preventDefault();        
      if (typeof localStorage == 'object' && document.location.href.indexOf('/read') > -1)
        localStorage.setItem('pocket_fromreadarticle','1');
      var basehref3 = 'http://getpocket.com/a/queue/';
      if (typeof localStorage == 'object' && localStorage.getItem('pocket_latestqueueview') == 'list')
        Pocket.jumpToLocation(basehref3 + 'list/');
      else
        Pocket.jumpToLocation(basehref3);
    }
    // for v, open original item in new window
    if (!e.altKey && !e.ctrlKey && !e.metaKey && e.keyCode == 118)
    {
      e.preventDefault();
      // check if we're on the actual article
      var reader = jQuery('#page_reader');
      if (!reader.length) return;
      var articleoriginal = reader.find('.original');
      if (articleoriginal.length && articleoriginal.children('a').length)
        window.open(articleoriginal.children('a').attr('href'));
    }
    // for shift + / (?), open/close help overlay
    if (e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey && e.keyCode == 63)
    {
      e.preventDefault();
      var overlay = jQuery('#help_overlay');
      if (!overlay.length || !overlay.filter(':visible').length)
        Pocket.showHelpOverlay();
      else
        Pocket.closeHelpOverlay();
    }
  }
};

(function($) 
{
  var queueInit = function()
  {
    if (typeof(localStorage) == 'object')
    {
      var index = localStorage.getItem('pocket_activeindex');
      var latestqueue = document.location.href.match(/a\/(.*)\//);
      if (typeof latestqueue == 'object')
      {
        latestqueue = latestqueue[1];
      }
      if (index !== null)
      {
        if (!parseInt(index,10) && parseInt(index,10) !== 0)
          index = 0;
        // pull index from local storage, auto scroll to position if necessary
        Pocket.activeIndex = parseInt(index,10);
        Pocket.active = Pocket.list.children('li').eq(Pocket.activeIndex);
        var prevqueue = localStorage.getItem('pocket_latestqueue');
        if (!Pocket.active.length)
          Pocket.resetActiveItem();
        // if index is not zero, don't always want to select and auto scroll down.
        // we do if:
        // user hit back on browser from text article
        // user selected 'u' to jump to unread when in text article
        // but, in other cases, reset
        if (typeof(localStorage) != 'object' || localStorage.getItem('pocket_fromreadarticle') != '1' || (prevqueue !== null && prevqueue != latestqueue))
          Pocket.resetActiveItem();
        else
        {
          // autoscroll to proper position
          Pocket.checkActiveForScroll(true);
        }
        localStorage.setItem('pocket_fromreadarticle','0');
      }
      else
        Pocket.resetActiveItem();
      // save latest queue position (unread, favorites, archive)
      localStorage.setItem('pocket_latestqueue',latestqueue);
      // save if we are in grid or list mode
      localStorage.setItem('pocket_latestqueueview',(document.location.href.indexOf('/list') > -1 ? 'list' : 'grid'));
    }
    else
      Pocket.resetActiveItem();
    if (typeof(localStorage) == 'object')
    {
      localStorage.setItem('pocket_activeindex',Pocket.activeIndex);
    }
    if (!Pocket.active.length) return;
    Pocket.list.children('li').removeClass('active');
    Pocket.active.addClass('active');
    // handle keyboard focus post archiving items
    Pocket.list.on('click','.action_mark',function()
    {
      var nextactive;
      if (Pocket.active.prev().length)
      {
        nextactive = Pocket.active.prev();
        Pocket.activeIndex--;
      }
      else
      {
        nextactive = Pocket.active.next();
        Pocket.activeIndex++;
      }
      Pocket.active.removeClass('active');
      nextactive.addClass('active');
      Pocket.active = nextactive;
      if (typeof(localStorage) == 'object')
        localStorage.setItem('pocket_activeindex',Pocket.activeIndex);
        Pocket.checkActiveForScroll();
    });
    // handle filtering - reset queue input entirely
    $('footer').find('#sort_selector,.toolbarButton > a').click(function()
    {
      Pocket.list = $('#queue');
      Pocket.resetActiveItem();
      var queueTimer = setInterval(function()
      {
        if (!$('#queue_list_wrapper').hasClass('loading'))
        {
          clearInterval(queueTimer);
          queueInit();
        }
      },250);
    });
    Pocket.list.find('.link').click(function()
    {
      var parentitem = $(this).parents('.item');
      Pocket.active = parentitem;
      if (!parentitem.prev().length)
        Pocket.activeIndex = 0;
      else
        Pocket.activeIndex = parentitem.prevUntil().length;
      localStorage.setItem('pocket_activeindex',Pocket.activeIndex);
    });
  };
  if ($('#queue').length)
  {
    Pocket.list = $('#queue');
    var queueTimer = setInterval(function()
    {
      if (!$('#queue_list_wrapper').hasClass('loading'))
      {
        clearInterval(queueTimer);
        queueInit();
      }
    },250);
  }
  else if (document.location.href.indexOf('/read') > -1)
  {
    $('#pagenav_back,#pagenav_mark').click(function()
    {
      if (typeof(localStorage) == 'object')
        localStorage.setItem('pocket_fromreadarticle','1');
      var queueCheck = setInterval(function()
      {
        if ($('#queue').length && !$('#queue_list_wrapper').hasClass('loading'))
        {
          clearInterval(queueCheck);
          Pocket.list = $('#queue');
          queueInit();
        }
      },500);
    });
  }
  $(window).keypress(function(e) 
  {
    if (e.target.tagName != 'INPUT')
      Pocket.keyCheck(e);
  });
})(jQuery);