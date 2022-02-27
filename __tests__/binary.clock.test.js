const index = require('../src/index.js');


test('It notifies when time is processed', () => {
    const hoursCallback = jest.fn();
    const minutesCallback = jest.fn();
    const secondsCallback = jest.fn();
    let obj = new index.BinaryTimeParser();
    obj.hoursSub = hoursCallback;
    obj.minutesSub = minutesCallback;
    obj.secondsSub = secondsCallback;
    obj.processTime();
    expect(hoursCallback.mock.calls.length).toBe(1);
    expect(minutesCallback.mock.calls.length).toBe(1);
    expect(secondsCallback.mock.calls.length).toBe(1);
})

test('It toggles bc-active status when 0 or 1 is received.', () => {
    const mockClassAdd = jest.fn();
    const mockClassRemove = jest.fn();
    const mockElement = {
        classList: {
            add: mockClassAdd,
            remove: mockClassRemove
        }
    }
    const bulb = new index.BinaryBulb()

    bulb.element = mockElement;
    bulb.notify(1);
    expect(mockClassAdd.mock.calls.length).toBe(1);
    expect(mockClassAdd.mock.calls[0][0]).toBe('bc-active');

    bulb.notify(0);
    expect(mockClassRemove.mock.calls.length).toBe(1);
    expect(mockClassRemove.mock.calls[0][0]).toBe('bc-active');
})

test('It appends the list item to the unordered list', () => {
    const mockAppendChild = jest.fn();
    const mockUL = {
        appendChild: mockAppendChild
    }
    let bulb = new index.BinaryBulb();
    expect(bulb.element).toBeNull();
    bulb.render(mockUL);
    expect(mockAppendChild.mock.calls.length).toBe(1);
    expect(bulb.element).toBeTruthy();
})

test('It converts to binary with a minimum of four digits', () => {
    const timeParser = new index.BinaryTimeParser();
    const dec = 1;
    expect(timeParser.convertToBinary(dec)).toEqual('0001');
})

test('It gives the proper digits for military time', () => {
    const timeParser = new index.BinaryTimeParser();
    const binaryClock = new index.BinaryClock(timeParser, null);
    const hourValues = binaryClock.values("hours");
    const minuteValues = binaryClock.values("minutes");

    expect(hourValues[0].id).toBe("hours-10");
    expect(hourValues[1].id).toBe("hours-1");

    expect(hourValues[0].digits).toBe(2);
    expect(hourValues[1].digits).toBe(4);

    expect(minuteValues[0].id).toBe("minutes-10");
    expect(minuteValues[1].id).toBe("minutes-1");

    expect(minuteValues[0].digits).toBe(3);
    expect(minuteValues[1].digits).toBe(4);
})

test('It creates a column', () => {
    const timeParser = new index.BinaryTimeParser();
    const binaryClock = new index.BinaryClock(timeParser, null);
    binaryClock.segments.hours['10'] = [];
    const segment = binaryClock.segments.hours['10'];

    binaryClock.column('bc-section-hours', 2, segment);
    expect(binaryClock.segments.hours['10'].length).toBe(2);
})

test('It creates the correct number of segments.', () => {
    const mockAppendChild = jest.fn()
    const mockApp = {
        appendChild: mockAppendChild
    }
    const timeParser = new index.BinaryTimeParser();
    const binaryClock = new index.BinaryClock(timeParser, mockApp);

    binaryClock.setup();
    binaryClock.ui();

    expect(binaryClock.segments.hours['1'].length).toBe(4);
    expect(binaryClock.segments.hours['10'].length).toBe(2);

    expect(binaryClock.segments.minutes['1'].length).toBe(4);
    expect(binaryClock.segments.minutes['10'].length).toBe(3);

    expect(binaryClock.segments.seconds['1'].length).toBe(4);
    expect(binaryClock.segments.seconds['10'].length).toBe(3);
})

test('It highlights the correct digits.', () => {
    const mockAppendChild = jest.fn()
    const mockApp = {
        appendChild: mockAppendChild
    }

    const timeParser = new index.BinaryTimeParser();
    const binaryClock = new index.BinaryClock(timeParser, mockApp);

    binaryClock.setup();
    binaryClock.ui();
    binaryClock.seconds(9);

    let secondsOnes = binaryClock.segments.seconds['1'];
    let secondsTens = binaryClock.segments.seconds['10'];

    expect(secondsOnes[0].element.classList.contains('bc-active')).toBe(true);
    expect(secondsOnes[1].element.classList.contains('bc-active')).toBe(false);
    expect(secondsOnes[2].element.classList.contains('bc-active')).toBe(false);
    expect(secondsOnes[3].element.classList.contains('bc-active')).toBe(true);

    expect(secondsTens[0].element.classList.contains('bc-active')).toBe(false);
    expect(secondsTens[1].element.classList.contains('bc-active')).toBe(false);
    expect(secondsTens[2].element.classList.contains('bc-active')).toBe(false);
})