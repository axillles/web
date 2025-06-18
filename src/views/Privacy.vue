<template>
  <div class="privacy-policy">
    <div class="container">
      <h1>Политика конфиденциальности</h1>

      <section class="policy-section">
        <h2>1. Общие положения</h2>
        <p>
          Настоящая политика обработки персональных данных составлена в соответствии с требованиями
          Закона от 14.05.2021. №99-3 «О защите персональных данных» и определяет порядок
          обработки персональных данных и меры по обеспечению безопасности персональных данных.
        </p>
      </section>

      <section class="policy-section">
        <h2>2. Основные понятия</h2>
        <ul>
          <li>
            <strong>Персональные данные</strong> – любая информация, относящаяся к прямо или косвенно
            определенному или определяемому физическому лицу (субъекту персональных данных).
          </li>
          <li>
            <strong>Обработка персональных данных</strong> – любое действие (операция) или совокупность
            действий (операций) с персональными данными, совершаемых с использованием средств
            автоматизации или без их использования.
          </li>
        </ul>
      </section>

      <section class="policy-section">
        <h2>3. Файлы cookie</h2>
        <p>
          Для корректного функционирования сайта мы используем следующие типы файлов cookie:
        </p>
        <ul>
          <li>
            <strong>Необходимые файлы cookie</strong> – обеспечивают работу основных функций сайта,
            таких как навигация и доступ к защищенным разделам. Сайт не может корректно работать без
            этих файлов.
          </li>
          <li>
            <strong>Аналитические файлы cookie</strong> – помогают нам понять, как посетители
            взаимодействуют с сайтом, собирая и предоставляя информацию в анонимной форме.
          </li>
          <li>
            <strong>Маркетинговые файлы cookie</strong> – используются для отслеживания посетителей
            на веб-сайтах с целью отображения релевантной рекламы.
          </li>
        </ul>
      </section>

      <section class="policy-section">
        <h2>4. Сбор и использование информации</h2>
        <p>Мы собираем следующие типы информации:</p>
        <ul>
          <li>Имя и контактные данные</li>
          <li>Информация о заказах и транзакциях</li>
          <li>Технические данные (IP-адрес, тип браузера)</li>
          <li>Данные об использовании сайта</li>
        </ul>
      </section>

      <section class="policy-section">
        <h2>5. Права пользователя</h2>
        <p>Вы имеете право:</p>
        <ul>
          <li>Получить информацию о ваших персональных данных</li>
          <li>Требовать исправления неточных данных</li>
          <li>Требовать удаления ваших данных</li>
          <li>Отозвать согласие на обработку данных</li>
          <li>Управлять настройками файлов cookie</li>
        </ul>
      </section>

      <section class="policy-section">
        <h2>6. Безопасность данных</h2>
        <p>
          Мы принимаем необходимые организационные и технические меры для защиты персональных
          данных от неправомерного или случайного доступа, уничтожения, изменения, блокирования,
          копирования, распространения, а также от иных неправомерных действий с ней третьих лиц.
        </p>
      </section>

      <section class="policy-section">
        <h2>7. Контактная информация</h2>
        <p>
          По всем вопросам, связанным с обработкой персональных данных, вы можете обратиться к нам:
        </p>
        <ul>
          <li>По электронной почте: nklsupabaseadm@gmail.com</li>
          <li>По телефону: +375 33 605-29-84</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Privacy'
}
</script>

<style scoped>
.privacy-policy {
  padding: 2rem 0;
  color: var(--text-primary);
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
}

h1 {
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
}

.policy-section {
  margin-bottom: 3rem;
  background: var(--bg-secondary);
  padding: 2rem;
  border-radius: 8px;
  box-shadow: var(--card-shadow);
}

h2 {
  color: var(--accent-primary);
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

p {
  margin-bottom: 1rem;
  line-height: 1.6;
  color: var(--text-secondary);
}

ul {
  list-style: none;
  padding-left: 0;
}

li {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
  position: relative;
  color: var(--text-secondary);
}

li::before {
  content: "•";
  color: var(--accent-primary);
  position: absolute;
  left: 0;
}

strong {
  color: var(--text-primary);
  font-weight: 500;
}

@media (max-width: 768px) {
  .privacy-policy {
    padding: 1rem 0;
  }

  .policy-section {
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  h1 {
    font-size: 1.75rem;
  }

  h2 {
    font-size: 1.25rem;
  }
}
</style>
