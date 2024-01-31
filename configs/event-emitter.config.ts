import { EventEmitterModuleOptions } from '@nestjs/event-emitter/dist/interfaces';

export const eventEmitterConfig: EventEmitterModuleOptions = {
  // 와일드카드 (*)를 사용하려면 true
  wildcard: false,

  // namespace를 구분할 구분자
  delimiter: '.',

  // newListener event를 사용하려면 true
  newListener: false,

  // removeListener event를 사용하려면 true
  removeListener: false,

  // 하나의 event에 최대로 할당될 수 있는 Listener 갯수
  maxListeners: 10,

  // 최대 수보다 많은 Listener가 할당되면 메모리 누수 메시지에 이벤트 이름 표시
  verboseMemoryLeak: true,

  // 오류 이벤트가 발생하고 Listener가 없는 경우 uncaughtException 발생을 비활성화합니다.
  ignoreErrors: false,
};
