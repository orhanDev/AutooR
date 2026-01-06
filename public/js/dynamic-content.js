(function() {
    'use strict';
    
    function initDynamicForm() {
        const formContainer = document.getElementById('date-location-form');
        if (!formContainer) return;
        
        const locations = [
            { value: 'berlin', label: 'Berlin Zentrum' },
            { value: 'hamburg', label: 'Hamburg Zentrum' },
            { value: 'münchen', label: 'München Zentrum' },
            { value: 'köln', label: 'Köln Zentrum' },
            { value: 'frankfurt', label: 'Frankfurt am Main Zentrum' },
            { value: 'stuttgart', label: 'Stuttgart Zentrum' }
        ];
        
        const times = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
        
        function generateDateOptions() {
            const options = [];
            const today = new Date();
            for (let i = 0; i < 31; i++) {
                const date = new Date(today);
                date.setDate(today.getDate() + i);
                const value = date.toISOString().split('T')[0];
                const display = date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
                options.push({ value, display });
            }
            return options;
        }
        
        const dateOptions = generateDateOptions();
        
        const desktopForm = formContainer.querySelector('.desktop-search-layout');
        if (desktopForm) {
            const pickupLocation = desktopForm.querySelector('#pickup-location-selector');
            const dropoffLocation = desktopForm.querySelector('#dropoff-location-selector');
            const pickupDate = desktopForm.querySelector('#pickup-date-selector');
            const dropoffDate = desktopForm.querySelector('#dropoff-date-selector');
            const pickupTime = desktopForm.querySelector('#pickup-time');
            const dropoffTime = desktopForm.querySelector('#dropoff-time');
            
            if (pickupLocation) {
                pickupLocation.innerHTML = '<option value=""></option>';
                locations.forEach(loc => {
                    const option = document.createElement('option');
                    option.value = loc.value;
                    option.textContent = loc.label;
                    pickupLocation.appendChild(option);
                });
            }
            
            if (dropoffLocation) {
                dropoffLocation.innerHTML = '<option value=""></option>';
                locations.forEach(loc => {
                    const option = document.createElement('option');
                    option.value = loc.value;
                    option.textContent = loc.label;
                    dropoffLocation.appendChild(option);
                });
            }
            
            if (pickupDate) {
                pickupDate.innerHTML = '<option value=""></option>';
                dateOptions.forEach(date => {
                    const option = document.createElement('option');
                    option.value = date.value;
                    option.textContent = date.display;
                    pickupDate.appendChild(option);
                });
            }
            
            if (dropoffDate) {
                dropoffDate.innerHTML = '<option value=""></option>';
                dateOptions.forEach(date => {
                    const option = document.createElement('option');
                    option.value = date.value;
                    option.textContent = date.display;
                    dropoffDate.appendChild(option);
                });
            }
            
            if (pickupTime) {
                pickupTime.innerHTML = '<option value=""></option>';
                times.forEach(time => {
                    const option = document.createElement('option');
                    option.value = time;
                    option.textContent = time;
                    pickupTime.appendChild(option);
                });
            }
            
            if (dropoffTime) {
                dropoffTime.innerHTML = '<option value=""></option>';
                times.forEach(time => {
                    const option = document.createElement('option');
                    option.value = time;
                    option.textContent = time;
                    dropoffTime.appendChild(option);
                });
            }
        }
        
        const mobileForm = formContainer.querySelector('.mobile-search-layout');
        if (mobileForm) {
            const mobilePickupLocation = mobileForm.querySelector('#pickup-location-selector-mobile');
            const mobileDropoffLocation = mobileForm.querySelector('#dropoff-location-selector-mobile');
            const mobilePickupDate = mobileForm.querySelector('#pickup-date-selector-mobile');
            const mobileDropoffDate = mobileForm.querySelector('#dropoff-date-selector-mobile');
            const mobilePickupTime = mobileForm.querySelector('#pickup-time-mobile');
            const mobileDropoffTime = mobileForm.querySelector('#dropoff-time-mobile');
            
            if (mobilePickupLocation) {
                mobilePickupLocation.innerHTML = '<option value=""></option>';
                locations.forEach(loc => {
                    const option = document.createElement('option');
                    option.value = loc.value;
                    option.textContent = loc.label;
                    mobilePickupLocation.appendChild(option);
                });
            }
            
            if (mobileDropoffLocation) {
                mobileDropoffLocation.innerHTML = '<option value=""></option>';
                locations.forEach(loc => {
                    const option = document.createElement('option');
                    option.value = loc.value;
                    option.textContent = loc.label;
                    mobileDropoffLocation.appendChild(option);
                });
            }
            
            if (mobilePickupDate) {
                mobilePickupDate.innerHTML = '<option value=""></option>';
                dateOptions.forEach(date => {
                    const option = document.createElement('option');
                    option.value = date.value;
                    option.textContent = date.display;
                    mobilePickupDate.appendChild(option);
                });
            }
            
            if (mobileDropoffDate) {
                mobileDropoffDate.innerHTML = '<option value=""></option>';
                dateOptions.forEach(date => {
                    const option = document.createElement('option');
                    option.value = date.value;
                    option.textContent = date.display;
                    mobileDropoffDate.appendChild(option);
                });
            }
            
            if (mobilePickupTime) {
                mobilePickupTime.innerHTML = '<option value=""></option>';
                times.forEach(time => {
                    const option = document.createElement('option');
                    option.value = time;
                    option.textContent = time;
                    mobilePickupTime.appendChild(option);
                });
            }
            
            if (mobileDropoffTime) {
                mobileDropoffTime.innerHTML = '<option value=""></option>';
                times.forEach(time => {
                    const option = document.createElement('option');
                    option.value = time;
                    option.textContent = time;
                    mobileDropoffTime.appendChild(option);
                });
            }
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDynamicForm);
    } else {
        initDynamicForm();
    }
    
})();

