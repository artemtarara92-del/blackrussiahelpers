document.addEventListener('DOMContentLoaded', () => {

    /* =========================================
       АКТИВНЫЙ ПУНКТ МЕНЮ
       ========================================= */

    const page = document.body.dataset.page || 'index';

    document
        .querySelectorAll('.nav a[data-page]')
        .forEach(link => {

            if (link.dataset.page === page) {
                link.classList.add('active');
            }

        });


    /* =========================================
       МОБИЛЬНОЕ МЕНЮ
       ========================================= */

    const menuToggle = document.querySelector('#menuToggle');
    const mainNav = document.querySelector('#mainNav');

    if (menuToggle && mainNav) {

        menuToggle.setAttribute('aria-expanded', 'false');

        menuToggle.addEventListener('click', () => {

            const opened = mainNav.classList.toggle('open');

            menuToggle.setAttribute(
                'aria-expanded',
                opened ? 'true' : 'false'
            );

        });


        mainNav.querySelectorAll('a').forEach(link => {

            link.addEventListener('click', () => {

                mainNav.classList.remove('open');

                menuToggle.setAttribute(
                    'aria-expanded',
                    'false'
                );

            });

        });

    }


    /* =========================================
       АНИМАЦИЯ ПОЯВЛЕНИЯ
       ========================================= */

    const revealObserver = new IntersectionObserver(
        entries => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add('visible');

                    revealObserver.unobserve(entry.target);

                }

            });

        },
        {
            threshold: 0.1
        }
    );


    function initReveal() {

        document
            .querySelectorAll('.reveal')
            .forEach(element => {

                if (!element.classList.contains('visible')) {
                    revealObserver.observe(element);
                }

            });

    }


    initReveal();


    /* =========================================
       ПАРАЛЛАКС
       ========================================= */

    document
        .querySelectorAll('[data-parallax]')
        .forEach(element => {

            window.addEventListener(
                'scroll',
                () => {

                    element.style.transform =
                        `translateY(${window.scrollY * 0.04}px)`;

                },
                {
                    passive: true
                }
            );

        });


    /* =========================================
       FAQ
       ========================================= */

    document
        .querySelectorAll('.faq-question')
        .forEach(button => {

            button.addEventListener('click', () => {

                const item = button.closest('.faq-item');

                if (!item) {
                    return;
                }

                const opened = item.classList.toggle('open');

                button.setAttribute(
                    'aria-expanded',
                    opened ? 'true' : 'false'
                );

            });

        });


    /* =========================================
       СИНХРОНИЗАЦИЯ НОВОСТЕЙ
       ========================================= */

    async function syncNews() {

        /*
         * Работаем только на главной странице.
         * На news.html этот код ничего не меняет.
         */

        if (page !== 'index') {
            return;
        }


        const newsList = document.querySelector('.news-list');

        if (!newsList) {
            return;
        }


        try {

            /*
             * Загружаем news.html
             */

            const response = await fetch('news.html', {
                cache: 'no-store'
            });


            if (!response.ok) {
                throw new Error(
                    `Не удалось загрузить news.html: ${response.status}`
                );
            }


            const html = await response.text();


            /*
             * Создаём временный документ,
             * чтобы получить новости из news.html.
             */

            const parser = new DOMParser();

            const newsDocument = parser.parseFromString(
                html,
                'text/html'
            );


            /*
             * Находим все новости.
             */

            const sourceNews = newsDocument.querySelectorAll(
                '.news-list article.news-item'
            );


            if (!sourceNews.length) {

                console.warn(
                    'В news.html не найдены новости.'
                );

                return;

            }


            /*
             * Берём максимум 3 последние новости.
             */

            const latestNews = Array.from(sourceNews)
                .slice(0, 3);


            /*
             * Полностью очищаем старые новости
             * на главной странице.
             */

            newsList.innerHTML = '';


            /*
             * Создаём новости для главной страницы.
             */

            latestNews.forEach((sourceItem, index) => {

                const date = sourceItem.querySelector('.news-date');

                const title = sourceItem.querySelector('h2');

                const description = sourceItem.querySelector('p');


                /*
                 * Если это пустая новость —
                 * пропускаем её.
                 */

                const titleText =
                    title?.textContent.trim() || '';

                const descriptionText =
                    description?.textContent.trim() || '';

                const dateDay =
                    date?.querySelector('b')?.textContent.trim() || '';

                const dateMonth =
                    date?.querySelector('small')?.textContent.trim() || '';


                if (
                    !titleText ||
                    titleText === '.'
                ) {
                    return;
                }


                /*
                 * Создаём блок новости.
                 */

                const newsItem = document.createElement('div');

                newsItem.className =
                    'news-item reveal';


                /*
                 * Для каждой новости
                 * чередуем цвет точки.
                 */

                const dotClass =
                    index % 2 === 0
                        ? 'dot'
                        : 'dot cyan';


                newsItem.innerHTML = `

                    <div class="news-date">

                        <b>
                            ${escapeHtml(dateDay)}
                        </b>

                        <small>
                            ${escapeHtml(dateMonth)}
                        </small>

                    </div>


                    <div>

                        <h4>

                            <span class="${dotClass}"></span>

                            ${escapeHtml(titleText)}

                        </h4>


                        <p>
                            ${escapeHtml(descriptionText)}
                        </p>

                    </div>

                `;


                newsList.appendChild(newsItem);


                /*
                 * Запускаем анимацию для новой новости.
                 */

                revealObserver.observe(newsItem);

            });

        }


        catch (error) {

            console.error(
                'Ошибка синхронизации новостей:',
                error
            );

        }

    }


    /* =========================================
       ЗАЩИТА ОТ HTML В НОВОСТЯХ
       ========================================= */

    function escapeHtml(text) {

        const div = document.createElement('div');

        div.textContent = text;

        return div.innerHTML;

    }


    /* =========================================
       ЗАПУСК СИНХРОНИЗАЦИИ
       ========================================= */

    syncNews();

});
