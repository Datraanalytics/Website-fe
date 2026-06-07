// Mobile Menu Toggle
function toggleMobileMenu() {
    var nav = document.querySelector('.nav');
    var mobileBtn = document.querySelector('.mobile-menu-btn');

    if (nav) {
        nav.classList.toggle('active');

        if (mobileBtn) {
            var icon = mobileBtn.querySelector('i');
            if (icon) {
                if (nav.classList.contains('active')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        }
    }
}

// Social Sharing Functions
function shareOnLinkedIn() {
    var url = encodeURIComponent(window.location.href);
    window.open('https://www.linkedin.com/sharing/share-offsite/?url=' + url, '_blank', 'width=600,height=500');
}

function shareOnTwitter() {
    var url = encodeURIComponent(window.location.href);
    var title = encodeURIComponent(document.title);
    window.open('https://twitter.com/intent/tweet?url=' + url + '&text=' + title, '_blank', 'width=600,height=400');
}

function shareOnFacebook() {
    var url = encodeURIComponent(window.location.href);
    window.open('https://www.facebook.com/sharer/sharer.php?u=' + url, '_blank', 'width=600,height=500');
}

function copyPageLink() {
    navigator.clipboard.writeText(window.location.href).then(function() {
        var btn = event.currentTarget;
        var icon = btn.querySelector('i');
        icon.classList.remove('fa-link');
        icon.classList.add('fa-check');
        setTimeout(function() {
            icon.classList.remove('fa-check');
            icon.classList.add('fa-link');
        }, 2000);
    });
}

// Close mobile menu when clicking a nav link
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.nav-link').forEach(function(link) {
        link.addEventListener('click', function() {
            var nav = document.querySelector('.nav');
            var mobileBtn = document.querySelector('.mobile-menu-btn');
            if (nav && nav.classList.contains('active')) {
                nav.classList.remove('active');
                var icon = mobileBtn ? mobileBtn.querySelector('i') : null;
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
    });
});
